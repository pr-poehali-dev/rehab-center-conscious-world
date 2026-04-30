import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import { BLOG_POSTS } from "@/data/blogPosts";

function renderContent(content: string) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return <h2 key={i} className="font-display text-2xl md:text-3xl text-deep-slate mt-10 mb-4">{line.slice(3)}</h2>;
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-body font-semibold text-deep-slate mt-4 mb-1">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith("- ")) {
      return <li key={i} className="font-body text-muted-foreground leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
    }
    if (line.match(/^\d+\. /)) {
      return <li key={i} className="font-body text-muted-foreground leading-relaxed ml-4 list-decimal">{line.replace(/^\d+\. /, "")}</li>;
    }
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="font-body text-muted-foreground leading-relaxed">{line}</p>;
  });
}

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [bookingOpen, setBookingOpen] = useState(false);

  const post = BLOG_POSTS.find(p => p.id === id);
  if (!post) return <Navigate to="/blog" replace />;

  const otherPosts = BLOG_POSTS.filter(p => p.id !== id).slice(0, 2);

  return (
    <div className="min-h-screen bg-background font-body">
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Navbar onBooking={() => setBookingOpen(true)} />

      {/* Хлебные крошки */}
      <div className="pt-20 pb-0 px-6 bg-white border-b border-border">
        <div className="container-max py-4 flex items-center gap-2 text-sm font-body text-muted-foreground">
          <Link to="/" className="hover:text-sage transition-colors">Главная</Link>
          <Icon name="ChevronRight" size={14} />
          <Link to="/blog" className="hover:text-sage transition-colors">Блог</Link>
          <Icon name="ChevronRight" size={14} />
          <span className="text-deep-slate line-clamp-1">{post.title}</span>
        </div>
      </div>

      {/* Шапка статьи */}
      <section className="py-14 px-6 bg-warm-cream flower-of-life-bg">
        <div className="container-max max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-body text-xs uppercase tracking-wider text-sage bg-sage-light rounded-full px-3 py-1">
              {post.tag}
            </span>
            <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Clock" size={12} /> {post.readTime}
            </span>
            <span className="font-body text-xs text-muted-foreground">{post.date}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-deep-slate leading-tight mb-6">
            {post.title}
          </h1>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            {post.intro}
          </p>
        </div>
      </section>

      {/* Обложка */}
      <div className="px-6 bg-white">
        <div className="container-max max-w-3xl">
          <div className="h-56 md:h-72 bg-sage-light rounded-2xl flex items-center justify-center -mt-6 border border-border">
            <Icon name="BookOpen" size={64} className="text-sage opacity-30" />
          </div>
        </div>
      </div>

      {/* Текст статьи */}
      <section className="py-12 px-6 bg-white">
        <div className="container-max max-w-3xl">
          <div className="prose-custom space-y-2">
            {renderContent(post.content)}
          </div>

          {/* Разделитель */}
          <div className="border-t border-border mt-12 pt-8 flex items-center justify-between flex-wrap gap-4">
            <Link to="/blog">
              <Button variant="outline" className="font-body border-warm-tan text-deep-slate gap-2">
                <Icon name="ArrowLeft" size={14} />
                Все статьи
              </Button>
            </Link>
            <Button
              onClick={() => setBookingOpen(true)}
              className="bg-sage text-primary-foreground hover:opacity-90 font-body gap-2"
            >
              <Icon name="Calendar" size={14} />
              Записаться на консультацию
            </Button>
          </div>
        </div>
      </section>

      {/* Другие статьи */}
      {otherPosts.length > 0 && (
        <section className="py-14 px-6 bg-warm-cream flower-of-life-bg">
          <div className="container-max max-w-3xl">
            <h2 className="font-display text-3xl text-deep-slate mb-8">Читайте также</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {otherPosts.map(p => (
                <Link
                  key={p.id}
                  to={`/blog/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-border card-hover block"
                >
                  <div className="h-32 bg-sage-light flex items-center justify-center">
                    <Icon name="BookOpen" size={32} className="text-sage opacity-40 group-hover:opacity-70 transition-opacity" />
                  </div>
                  <div className="p-5">
                    <span className="font-body text-xs uppercase tracking-wider text-sage bg-sage-light rounded-full px-2.5 py-0.5 mb-3 inline-block">
                      {p.tag}
                    </span>
                    <h3 className="font-display text-lg text-deep-slate leading-snug group-hover:text-sage transition-colors">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
