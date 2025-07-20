import clientPromise from "lib/mongodb";

function getPermutations(num) {
  const digits = num.split("");
  const results = new Set();

  function permute(arr, l, r) {
    if (l === r) results.add(arr.join(""));
    else {
      for (let i = l; i <= r; i++) {
        [arr[l], arr[i]] = [arr[i], arr[l]];
        permute(arr, l + 1, r);
        [arr[l], arr[i]] = [arr[i], arr[l]];
      }
    }
  }

  permute(digits, 0, digits.length - 1);
  return Array.from(results);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("noshib786");
    const players = await db
      .collection("playersInput")
      .find({})
      .sort({ time: -1 })
      .toArray();

    const numberStats = {};
    const singleDigitPayouts = {};
    const numberAgents = {}; // { number: { agentId: { str, rumble, reverseRumble, permutationRumble, name } } }

    const totalAmounts = { OneD: 0, TwoD: 0, ThreeD: 0 };
    let afterOneD = 0,
      afterTwoD = 0,
      afterThreeD = 0;

    for (const player of players) {
      const cPercent = player.percentages || { oneD: 0, twoD: 0, threeD: 0 };
      const played = player.amountPlayed || {};

      totalAmounts.OneD += played.OneD || 0;
      totalAmounts.TwoD += played.TwoD || 0;
      totalAmounts.ThreeD += played.ThreeD || 0;

      afterOneD += (played.OneD || 0) * (1 - cPercent.oneD / 100);
      afterTwoD += (played.TwoD || 0) * (1 - cPercent.twoD / 100);
      afterThreeD += (played.ThreeD || 0) * (1 - cPercent.threeD / 100);

      for (const entry of player.entries || []) {
        const num = entry.input?.num || "";
        const str = entry.input?.str || 0;
        const rumble = Number(entry.input?.rumble) || 0;
        const amount = str + rumble;
        if (!num || typeof amount !== "number") continue;

        const agentId = player.agentId;
        const agentName = player.agentName || "Unknown";

        // Direct number
        if (!numberAgents[num]) numberAgents[num] = {};
        if (!numberAgents[num][agentId]) {
          numberAgents[num][agentId] = {
            str: 0,
            rumble: 0,

            name: agentName,
          };
        }
        numberAgents[num][agentId].str += str;
        numberAgents[num][agentId].rumble += rumble;

        if (num.length === 1) {
          singleDigitPayouts[num] = (singleDigitPayouts[num] || 0) + amount;
        }

        if (!numberStats[num]) {
          numberStats[num] = { str: 0, rumble: 0, length: num.length };
        }
        numberStats[num].str += str;
        numberStats[num].rumble += rumble;

        // Reverse number mapping for 2D
        if (num.length === 2) {
          const reversed = num.split("").reverse().join("");
          if (reversed !== num && rumble > 0) {
            if (!numberAgents[reversed]) numberAgents[reversed] = {};
            if (!numberAgents[reversed][agentId]) {
              numberAgents[reversed][agentId] = {
                // str: 0,
                str: "-",
                rumble: 0,
                name: agentName,
              };
            }
            // numberAgents[reversed][agentId].str += str;
            numberAgents[reversed][agentId].rumble += rumble;
          }
        }

        // Permutation mapping for 3D
        if (num.length === 3) {
          const perms = getPermutations(num);
          for (const p of perms) {
            if (p !== num && rumble > 0) {
              if (!numberAgents[p]) numberAgents[p] = {};
              if (!numberAgents[p][agentId]) {
                numberAgents[p][agentId] = {
                  // str: 0,
                  str: "-",
                  rumble: 0,

                  name: agentName,
                };
              }
              // numberAgents[p][agentId].str += str;
              numberAgents[p][agentId].rumble += rumble;
            }
          }
        }
      }
    }

    const finalTotals = {
      oneD: Number(afterOneD.toFixed(1)),
      twoD: Number(afterTwoD.toFixed(1)),
      threeD: Number(afterThreeD.toFixed(1)),
      total: Number((afterOneD + afterTwoD + afterThreeD).toFixed(1)),
    };

    const multipliers = {
      threeD: { str: 400, rumble: 80 },
      twoD: 60,
      single: 3,
    };

    const threeD = [];
    const twoD = [];

    for (const [num, data] of Object.entries(numberStats)) {
      const agentsRaw = numberAgents[num] || {};
      const agents = Object.entries(agentsRaw).map(([agentId, a]) => ({
        agentId,
        name: a.name,
        str: a.str,
        rumble: Number(a.rumble.toFixed(1)),
      }));

      if (data.length === 3) {
        const strPayout = data.str * multipliers.threeD.str;
        const perms = getPermutations(num);
        let rumbleSum = 0;
        for (const permNum of perms) {
          if (permNum !== num && numberStats[permNum]) {
            rumbleSum += numberStats[permNum].rumble;
          }
        }

        const rumblePayout =
          (data.rumble + rumbleSum) * multipliers.threeD.rumble;

        const digits = [...new Set(num.split(""))];
        const singleDetails = digits.map((d) => ({
          digit: d,
          amount: singleDigitPayouts[d]
            ? Number(singleDigitPayouts[d].toFixed(1))
            : 0,
        }));

        const singleSum = singleDetails.reduce(
          (sum, obj) => sum + obj.amount * multipliers.single,
          0
        );

        const payout = strPayout + rumblePayout + singleSum;
        const game = finalTotals.threeD + finalTotals.oneD;
        const PL = game - payout;
        const pl = (PL * 100) / game;

        threeD.push({
          number: num,
          str: Number(data.str.toFixed(1)),
          rumble: Number((data.rumble + rumbleSum).toFixed(1)),
          strPayout: Number(strPayout.toFixed(1)),
          rumblePayout: Number(rumblePayout.toFixed(1)),
          singleDetails,
          singleSum: Number(singleSum.toFixed(1)),
          payout: Number(payout.toFixed(1)),
          total: Number(game.toFixed(1)),
          PL: Number(PL.toFixed(1)),
          profitLoss: Number(pl.toFixed(1)),
          agents,
        });
      } else if (data.length === 2) {
        const strPayout = data.str * multipliers.twoD;
        const reversed = num.split("").reverse().join("");
        const reverseRumble =
          reversed !== num ? numberStats[reversed]?.rumble || 0 : 0;

        const payout = strPayout + reverseRumble * multipliers.twoD;
        const game = finalTotals.twoD;
        const PL = game - payout;
        const pl = (PL * 100) / game;

        twoD.push({
          number: num,
          str: Number(data.str.toFixed(1)),
          rumble: Number(reverseRumble.toFixed(1)),
          strPayout: Number(strPayout.toFixed(1)),
          rumblePayout: Number((reverseRumble * multipliers.twoD).toFixed(1)),
          payout: Number(payout.toFixed(1)),
          total: Number(game.toFixed(1)),
          PL: Number(PL.toFixed(1)),
          profitLoss: Number(pl.toFixed(1)),
          agents,
        });
      }
    }

    return res.status(200).json({
      threeD,
      twoD,
      finalTotals,
      totalAmounts: {
        oneD: Number(totalAmounts.OneD.toFixed(1)),
        twoD: Number(totalAmounts.TwoD.toFixed(1)),
        threeD: Number(totalAmounts.ThreeD.toFixed(1)),
        total: Number(
          (totalAmounts.OneD + totalAmounts.TwoD + totalAmounts.ThreeD).toFixed(
            1
          )
        ),
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
