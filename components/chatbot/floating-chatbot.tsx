"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const faqAnswers: Record<string, string> = {
  курсы: "У нас есть курсы для всех уровней: начальный, средний и продвинутый. Вы можете найти их в разделе 'Курсы'.",
  записаться: "Чтобы записаться на курс, перейдите на страницу курса и нажмите кнопку 'Записаться'.",
  прогресс: "Ваш прогресс отображается на главной странице личного кабинета. Вы можете видеть процент завершения каждого курса.",
  йога: "Йога — это древняя практика, которая объединяет физические упражнения, дыхательные техники и медитацию для улучшения здоровья и благополучия.",
  алматы: "Мы предлагаем онлайн курсы йоги для жителей Алматы и всех районов города.",
  помощь: "Если вам нужна помощь, вы можете написать администратору через раздел 'Чат' в личном кабинете.",
};

const defaultAnswers = [
  "Спасибо за вопрос! Я могу помочь вам с информацией о курсах, записи и прогрессе.",
  "Для более детальной информации рекомендую обратиться к администратору через раздел 'Чат'.",
];

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    { text: "Привет! Я помощник ZenFlow. Чем могу помочь?", isBot: true },
  ]);
  const [input, setInput] = useState("");

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    for (const [keyword, answer] of Object.entries(faqAnswers)) {
      if (lowerQuestion.includes(keyword)) {
        return answer;
      }
    }
    
    return defaultAnswers[Math.floor(Math.random() * defaultAnswers.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);

    // Имитация ответа бота
    setTimeout(() => {
      const botAnswer = findAnswer(input);
      setMessages((prev) => [...prev, { text: botAnswer, isBot: true }]);
    }, 500);

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Плавающая кнопка */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 min-h-[56px] min-w-[56px]"
          size="icon"
          aria-label="Открыть чат-помощник"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Чат окно */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-96 shadow-xl z-50 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Помощник ZenFlow</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
                aria-label="Закрыть чат"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    message.isBot ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 max-w-[80%] text-sm",
                      message.isBot
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-3 flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите вопрос..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" className="min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0" aria-label="Отправить сообщение">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
