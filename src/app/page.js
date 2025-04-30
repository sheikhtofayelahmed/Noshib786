export default function HomePage() {
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🎮 Thai Lottery Agent - Number Game</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">🧱 Tech Stack</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Frontend:</strong> Next.js (App Router, JavaScript)</li>
          <li><strong>Styling:</strong> Tailwind CSS</li>
          <li><strong>Database:</strong> MongoDB Atlas (no Mongoose)</li>
          <li><strong>Authentication:</strong> Custom (if needed)</li>
          <li><strong>State Management:</strong> React Hooks</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">⚙️ Project Setup</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Initialized with <code>npx create-next-app@latest</code></li>
          <li>Tailwind CSS setup using <code>npm install -D tailwindcss postcss autoprefixer</code> and <code>npx tailwindcss init -p</code></li>
          <li>MongoDB Atlas connection via native <code>mongodb</code> driver</li>
          <li>Environment variable stored in <code>.env.local</code>:
            <pre className="bg-gray-100 p-2 rounded mt-1"><code>MONGODB_URI=your_mongo_connection_string</code></pre>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">📁 Folder Structure Highlights</h2>
        <ul className="list-disc list-inside space-y-1">
          <li><code>/app/</code> — App router pages like <code>layout.js</code> and <code>page.js</code></li>
          <li><code>/src/lib/mongodb.js</code> — MongoDB client connection</li>
          <li><code>/src/app/globals.css</code> — Global styles</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">🚀 Features Coming</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Input a 3-digit number</li>
          <li>Track total amount entered per number</li>
          <li>Declare winning number based on max entry</li>
          <li>Agent management system</li>
        </ul>
      </section>
    </main>
  );
}
