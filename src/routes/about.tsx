import { createFileRoute } from "@tanstack/react-router";
import { Disc3, Music, Users, Droplets, Truck, RefreshCw, Send } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Обо мне — ВИНИЛ LP SEVAS" },
      { name: "description", content: "Коллекция более 2000 LP. Личные встречи, мойка винила, отправка по всей России, пополнения каждые 1–2 недели." },
    ],
  }),
  component: AboutPage,
});

const features = [
  {
    icon: Music,
    title: "2000+ пластинок",
    text: "Большая коллекция — от классики рока и джаза до редких изданий и современных переизданий.",
  },
  {
    icon: Users,
    title: "Личная встреча",
    text: "Приезжайте посмотреть весь винил вживую — послушать, подержать в руках, выбрать спокойно и без спешки.",
  },
  {
    icon: Droplets,
    title: "Мойка винила",
    text: "Каждую пластинку лично мою и проверяю перед продажей.",
  },
  {
    icon: Truck,
    title: "Отправка по России",
    text: "Аккуратно упакую и отправлю в любой город — винил доедет в целости и сохранности.",
  },
  {
    icon: RefreshCw,
    title: "Пополнения 1–2 раза в неделю",
    text: "Регулярно появляются новые поступления — заглядывайте чаще, чтобы не пропустить редкие издания.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Hero */}
        <div className="relative mb-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="font-display text-4xl md:text-6xl tracking-wide">ОБО МНЕ</h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Я коллекционер винила из Севастополя. В моей коллекции более{" "}
            <span className="text-foreground font-medium">2000 LP</span> — и каждая
            пластинка прошла через мои руки: проверена, отмыта и готова звучать так,
            как задумано.
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 gap-4 mb-14">
          {features.map((f, i) => {
            const Icon = f.icon;
            const wide = i === features.length - 1 && features.length % 2 === 1;
            return (
              <div
                key={f.title}
                className={`group relative bg-card/80 backdrop-blur border border-border rounded-xl p-6 transition-all hover:border-gold/60 hover:-translate-y-0.5 ${
                  wide ? "sm:col-span-2" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-gold/10 group-hover:border-gold/40 transition-colors">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg tracking-wide mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card/80 to-primary/10 p-8 md:p-10 text-center">
          <Disc3 className="absolute -right-10 -bottom-10 h-48 w-48 text-primary/10" />
          <h2 className="font-display text-2xl md:text-3xl tracking-wide mb-3">
            Давайте поговорим о виниле
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Подобрать пластинку, договориться о встрече или уточнить наличие — пишите
            напрямую в Telegram. Отвечаю быстро.
          </p>
          <Button asChild size="lg" className="gap-2">
            <a
              href="https://t.me/Selling_vinyl_LP"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className="h-4 w-4" />
              Написать в Telegram
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
