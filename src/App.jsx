import React from "react";

const App = () => {
  const [prompt, setPrompt] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  function cleanMarkdown(text) {
    return text
      .replace(/[*_`#>-]/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();
  }

  async function chatBot() {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", content: prompt };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-maverick:free",
          messages: newMessages,
        }),
      });

      const data = await res.json();
      console.log(import.meta.env.VITE_OPEN_AI_API_KEY);
      const aiRawContent =
        data.choices?.[0]?.message?.content || data?.error?.message;
      const cleanedContent = cleanMarkdown(aiRawContent);
      const aiMessage = {
        role: "assistant",
        content: cleanedContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setPrompt("");
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen py-10 px-4 text-white">
      <div>
        <h2 className="text-4xl font-semibold text-center">Chat bot</h2>
        <p className="text-gray-500 text-center">
          Ask questions and get answers from the AI chat bot.
        </p>
        <hr className="my-4 border-gray-400" />
        {/* Chat Messages */}
        <div className="mt-6 max-w-[700px] mx-auto space-y-4 pb-32">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg flex flex-col ${
                msg.role === "user"
                  ? "bg-[#3b3b3b] text-white self-end ml-auto"
                  : "bg-[#1f1f1f] text-gray-200 self-start mr-auto"
              } max-w-[80%] whitespace-pre-wrap`}
            >
              <strong className="mr-2 mb-2">
                {msg.role === "user" ? "Question" : "Answer"}:
              </strong>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 justify-start items-center ml-2">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:.2s]"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:.4s]"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce [animation-delay:.6s]"></div>
            </div>
          )}
        </div>

        {/* Fixed input at the bottom */}
        <div className="fixed bottom-0 left-0 w-full bg-[#0f0f0f] px-4 py-4 border-t border-gray-700">
          <div className="max-w-[700px] mx-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter your question"
              className="flex-1 border border-gray-500 bg-transparent outline-none rounded text-white p-2"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") chatBot();
              }}
            />
            <button className="text-white px-4 py-2" onClick={chatBot}>
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
