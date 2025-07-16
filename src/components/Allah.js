// components/AllahBhorosha.js
import Image from "next/image";

export default function AllahBhorosha() {
  return (
    <div className="text-center mt-10">
      <h1 className="font-bangla text-xl md:text-2xl font-bold mb-4 text-cyan-300 drop-shadow-lg animate-flicker">
        নসীব ৭৮৬
      </h1>
      <Image
        src="/dowa.png"
        alt="Dowa"
        width={288}
        height={288}
        className="mx-auto drop-shadow-2xl animate-pulse"
      />
    </div>
  );
}
