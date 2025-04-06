import { useState, useEffect } from "react";

const participantRegex = /(?:ל|עבור)?\s*(\d{1,4})\s*(?:איש|משתתפים|אנשים)/;

export default function PicassoAIApp() {
  const [inputText, setInputText] = useState("");
  const [detectedMenu, setDetectedMenu] = useState("");
  const [output, setOutput] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://picasso.co.il/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("שגיאה בטעינת מוצרים", err);
        setError("לא הצלחנו לטעון את רשימת המוצרים. אנא נסה שוב מאוחר יותר.");
      });
  }, []);

  const menuKeywords = {
    "Happy Hour – חלבי": ["האפי האוור", "שעת שמחה", "happy hour"],
    "After Work – ארוחת ערב חלבית קלה": ["אחרי העבודה", "ארוחת ערב", "after work"],
    "כיבוד קל למפגש צוות / ישיבה": ["ישיבת צוות", "מפגש צוות", "כיבוד קל"],
    "קפה של בוקר – Light Morning": ["קפה של בוקר", "light morning", "הפסקת קפה"],
    "ברכות והוקרות – אירוע פרידה / קידום": ["פרידה", "קידום", "ברכות", "אירוע הוקרה"],
    "אירוע לקוחות / פרזנטציה עסקית": ["אירוע לקוחות", "פרזנטציה", "פגישה עסקית"],
    "ארוחת ערב פרווה – אחרי צום / ערב חג": ["ערב חג", "צום", "פרווה"],
    "Sweet Time – הפסקת עשר מתוקה": ["הפסקת עשר", "שעה עשר", "מתוק"],
    "ימי הולדת במשרד": ["יום הולדת", "ימי הולדת", "חגיגת יום הולדת"],
    "כיבוד לאירוע חינוך / גני ילדים": ["גן ילדים", "חינוך", "גני ילדים", "תלמידים"]
  };

  const detectMenuLogic = (text) => {
    const lowerText = text.toLowerCase();
    for (const [menu, keywords] of Object.entries(menuKeywords)) {
      if (keywords.some((kw) => lowerText.includes(kw))) {
        return menu;
      }
    }
    return "תפריט כללי – דרושה התאמה ידנית";
  };

  const extractParticipants = (text) => {
    const match = text.match(participantRegex);
    return match ? parseInt(match[1], 10) : 20;
  };

  const handleGenerate = () => {
    const menu = detectMenuLogic(inputText);
    const participants = extractParticipants(inputText);
    setDetectedMenu(menu);

    const sweets = Math.ceil(participants * 3);
    const savories = Math.ceil(participants * 2);
    const veggies = Math.ceil(participants / 15);

    const sweetItems = products.filter(p => p.category === "מתוקים").slice(0, 3);
    const savoryItems = products.filter(p => p.category === "מלוחים").slice(0, 2);

    const sweetCost = sweetItems.reduce((sum, item) => sum + item.price, 0);
    const savoryCost = savoryItems.reduce((sum, item) => sum + item.price, 0);
    const veggieCost = veggies * 59;

    const totalCost = sweetCost + savoryCost + veggieCost;

    const suggestion = `• תפריט מזוהה: ${menu}
• כמות משתתפים: ${participants}

• המלצה:
- ${savories} פריטים מלוחים:
  ${savoryItems.map(item => `• ${item.name}`).join("\n  ")}
- ${sweets} פריטים מתוקים:
  ${sweetItems.map(item => `• ${item.name}`).join("\n  ")}
- ${veggies} מגשי ירקות

• עלות כוללת מוערכת: כ-${totalCost.toLocaleString()} ₪

• אופציות שדרוג:
- מיץ טבעי סחוט (1 לאדם)
- יין (1 לכל 20 משתתפים)
- סט כלים
- כוסות צ׳ייסר (1.2 לאדם)`;

    setOutput(suggestion);
  };

  return (
    <div className="p-6 grid gap-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Picasso AI – מערכת הצעות חכמות</h1>
      <p className="text-base text-gray-600">
        הזן טקסט חופשי מהלקוח – המערכת תזהה את סוג האירוע ותפיק הצעה חכמה בהתאם.
      </p>

      <div className="grid gap-4">
        <label className="font-semibold">מה הלקוח ביקש?</label>
        <textarea
          className="border rounded-xl p-3 w-full min-h-[120px]"
          placeholder="לדוגמה: הרמת כוסית ל-45 איש, עדיפות לפרווה, בשעה 11..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      <button
        className="bg-black text-white px-6 py-3 rounded-2xl shadow-md hover:bg-gray-800 transition"
        onClick={handleGenerate}
      >
        הפק הצעה חכמה
      </button>

      {error && (
        <div className="mt-4 text-red-600 font-medium">
          ⚠️ {error}
        </div>
      )}

      {output && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">תוצאה:</h2>
          <pre className="bg-gray-100 p-4 rounded-xl whitespace-pre-wrap text-sm text-gray-800">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
