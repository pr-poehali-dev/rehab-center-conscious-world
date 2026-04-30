import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import { BLOG_POSTS } from "@/data/blogPosts";
import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import FlowerOfLife from "@/components/FlowerOfLife";

const TAGS = ["Все", "Психология", "Практики", "Семья"];

export default function Blog() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeTag, setActiveTag] = useState("Все");

  const filtered = activeTag === "Все" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.tag === activeTag);

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Hero */}
      <section className="pt-28 pb-14 px-6 bg-warm-cream flower-of-life-bg">
        <div className="container-max text-center">
          <div className="flex justify-center mb-6">
            <FlowerOfLife size={48} />
          </div>
          <p className="font-body text-sage text-sm uppercase tracking-[0.2em] mb-3">Блог</p>
          <h1 className="font-display text-5xl md:text-6xl text-deep-slate leading-tight mb-4">
            Статьи и советы
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
            Полезные материалы о психическом здоровье, восстановлении и осознанной жизни
          </p>
        </div>
      </section>

      {/* Фильтр по тегам */}
      <section className="py-8 px-6 bg-white border-b border-border">
        <div className="container-max flex items-center gap-3 flex-wrap">
          {TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`font-body text-sm px-4 py-2 rounded-full border transition-all ${
                activeTag === tag
                  ? "bg-sage text-primary-foreground border-sage"
                  : "border-warm-tan text-muted-foreground hover:border-sage/50 hover:text-deep-slate"
              }`}
            >
              {tag}
            </button>
          ))}
          <span className="ml-auto font-body text-sm text-muted-foreground">{filtered.length} статей</span>
        </div>
      </section>

      {/* Список статей */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-border card-hover cursor-pointer block"
              >
                <div className="h-44 bg-sage-light flex items-center justify-center">
                  <Icon name="BookOpen" size={44} className="text-sage opacity-40 group-hover:opacity-70 transition-opacity" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-body text-xs uppercase tracking-wider text-sage bg-sage-light rounded-full px-3 py-1">
                      {post.tag}
                    </span>
                    <span className="font-body text-xs text-muted-foreground ml-auto flex items-center gap-1">
                      <Icon name="Clock" size={11} />
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-display text-xl text-deep-slate leading-snug mb-3 group-hover:text-sage transition-colors">
                    {post.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {post.intro}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-body text-xs text-muted-foreground">{post.date}</p>
                    <span className="font-body text-xs text-sage flex items-center gap-1 group-hover:gap-2 transition-all">
                      Читать <Icon name="ArrowRight" size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-sage-light flower-of-life-bg">
        <div className="container-max text-center">
          <h2 className="font-display text-3xl md:text-4xl text-deep-slate mb-4">Нужна личная консультация?</h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            Наши специалисты готовы помочь — первый разговор бесплатно и без обязательств
          </p>
          <Button
            onClick={() => setBookingOpen(true)}
            className="bg-sage text-primary-foreground hover:opacity-90 font-body px-8 py-3 text-base"
          >
            Записаться на консультацию
          </Button>
        </div>
      </section>
    </div>
  );
}
