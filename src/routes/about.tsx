import { createFileRoute } from "@tanstack/react-router";
import { Disc3, Music, Heart, Mail, Users, Droplets, Truck, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Обо мне — ВИНИЛ LP SEVAS" },
      { name: "description", content: "Коллекция более 2000 LP. Личные встречи, мойка винила, отправка по всей России." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Disc3 className="h-10 w-10 text-primary vinyl-spin" />
          <h1 className="font-display text-4xl md:text-5xl tracking-wide">ОБО МНЕ</h1>
        </div>

        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          Привет! Я коллекционер винила. В моей коллекции более 2000 пластинок —
          от редких изданий до современных переизданий.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-card border border-border rounded-lg p-5">
            <Music className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-2xl">2000+</p>
            <p className="text-sm text-muted-foreground">пластинок в коллекции</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <Users className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-lg">Личная встреча</p>
            <p className="text-sm text-muted-foreground">можно посмотреть весь винил вживую</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <Droplets className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-lg">Мойка винила</p>
            <p className="text-sm text-muted-foreground">каждую пластинку мою лично</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <Truck className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-lg">Доставка</p>
            <p className="text-sm text-muted-foreground">отправка по всей России</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 sm:col-span-2">
            <RefreshCw className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-lg">Пополнения каждые 1–2 недели</p>
            <p className="text-sm text-muted-foreground">регулярно появляются новые пластинки</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
          <Mail className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Связаться со мной</p>
            <p className="text-sm text-muted-foreground">
              По вопросам покупки, личной встречи или отправки — пишите в Telegram @Selling_vinyl_LP.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
