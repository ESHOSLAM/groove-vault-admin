import { createFileRoute } from "@tanstack/react-router";
import { Disc3, Music, Heart, Mail } from "lucide-react";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Обо мне — ГРАМПЛАСТ" },
      { name: "description", content: "Коллекционер винила, меломан и хранитель звукового наследия." },
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
          Привет! Меня зовут коллекционер винила. Уже более 15 лет я собираю,
          реставрирую и продаю виниловые пластинки — от редких пресcингов 60-х
          до свежих переизданий любимых альбомов.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-card border border-border rounded-lg p-5">
            <Music className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-2xl">500+</p>
            <p className="text-sm text-muted-foreground">пластинок в коллекции</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <Heart className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-2xl">15 лет</p>
            <p className="text-sm text-muted-foreground">в мире винила</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <Disc3 className="h-6 w-6 text-gold mb-2" />
            <p className="font-display text-2xl">100%</p>
            <p className="text-sm text-muted-foreground">проверенное состояние</p>
          </div>
        </div>

        <h2 className="font-display text-2xl tracking-wide mb-3">МОЯ ИСТОРИЯ</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Всё началось с пластинки Pink Floyd, найденной на чердаке у бабушки.
          С того дня поиск редких изданий, тёплого звука и историй за каждым
          конвертом стал моей страстью. Здесь я делюсь тем, что собрал за годы
          охоты по барахолкам, частным коллекциям и аукционам.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Каждая пластинка в каталоге проверена, очищена и описана честно.
          Никаких сюрпризов — только настоящий аналоговый звук.
        </p>

        <div className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
          <Mail className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Связаться со мной</p>
            <p className="text-sm text-muted-foreground">
              По вопросам покупки, обмена или оценки — пишите на почту или в личные сообщения.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
