import ReactMarkdown from "react-markdown";
import { storageUrl, type PageBlock } from "@/lib/pages";

function widthClass(width?: string) {
  switch (width) {
    case "narrow":
      return "max-w-2xl mx-auto";
    case "wide":
      return "max-w-5xl mx-auto";
    case "full":
    default:
      return "w-full";
  }
}

function colsClass(cols?: string) {
  switch (String(cols)) {
    case "2":
      return "grid-cols-2";
    case "4":
      return "grid-cols-2 md:grid-cols-4";
    case "3":
    default:
      return "grid-cols-2 md:grid-cols-3";
  }
}

function Block({ block }: { block: PageBlock }) {
  const { type, data = {} } = block;

  switch (type) {
    case "text":
      return (
        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary">
          <ReactMarkdown>{data.body || ""}</ReactMarkdown>
        </div>
      );

    case "text_image": {
      const imageLeft = data.layout === "image-left";
      return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {imageLeft && data.image && (
            <img
              src={storageUrl(data.image)}
              alt={data.caption || ""}
              className="w-full rounded-2xl shadow-md object-cover"
            />
          )}
          <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary">
            <ReactMarkdown>{data.body || ""}</ReactMarkdown>
          </div>
          {!imageLeft && data.image && (
            <img
              src={storageUrl(data.image)}
              alt={data.caption || ""}
              className="w-full rounded-2xl shadow-md object-cover"
            />
          )}
        </div>
      );
    }

    case "image":
      if (!data.image) return null;
      return (
        <figure className={widthClass(data.width)}>
          <img
            src={storageUrl(data.image)}
            alt={data.caption || ""}
            className="w-full rounded-2xl shadow-md"
          />
          {data.caption && (
            <figcaption className="mt-2 text-center text-sm text-muted-foreground">
              {data.caption}
            </figcaption>
          )}
        </figure>
      );

    case "gallery": {
      const images: string[] = data.images || [];
      return (
        <div className={`grid gap-3 ${colsClass(data.columns)}`}>
          {images.map((img) => (
            <a
              key={img}
              href={data.lightbox ? storageUrl(img) : undefined}
              target={data.lightbox ? "_blank" : undefined}
              rel="noreferrer"
              className="block overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={storageUrl(img)}
                alt=""
                className="h-full w-full object-cover aspect-square"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      );
    }

    case "quote":
      return (
        <figure className="border-l-4 border-primary pl-6 py-2">
          <blockquote className="text-xl md:text-2xl font-serif italic text-foreground leading-relaxed">
            {data.body}
          </blockquote>
          {data.author && (
            <figcaption className="mt-3 text-sm uppercase tracking-wider text-muted-foreground">
              — {data.author}
            </figcaption>
          )}
        </figure>
      );

    case "cta":
      return (
        <section className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12">
          {data.title && (
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              {data.title}
            </h3>
          )}
          {data.description && (
            <p className="mt-3 text-primary-foreground/90 text-lg">
              {data.description}
            </p>
          )}
          {data.button_href && data.button_label && (
            <a
              href={data.button_href}
              className="mt-6 inline-flex items-center rounded-xl bg-background text-foreground h-12 px-6 font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              {data.button_label}
            </a>
          )}
        </section>
      );

    case "html":
      return <div dangerouslySetInnerHTML={{ __html: data.body || "" }} />;

    default:
      return null;
  }
}

export function PageBlocks({ blocks }: { blocks: PageBlock[] | null | undefined }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="space-y-10 md:space-y-14">
      {blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}
