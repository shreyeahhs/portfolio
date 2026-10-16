import { ArrowUpIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links, profile } from "../data/content";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="overflow-hidden">
      <div className="shell flex flex-wrap items-center gap-x-8 gap-y-3 pt-12">
        <p className="meta text-ink-faint">
          {profile.name}, {profile.city}
        </p>

        <a
          href={links.corpus}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft transition-colors hover:text-ink"
        >
          Prompt Corpus
          <ArrowUpRightIcon
            size={12}
            weight="bold"
            className="text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        <a
          href={links.juggle}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft transition-colors hover:text-ink"
        >
          Juggle
          <ArrowUpRightIcon
            size={12}
            weight="bold"
            className="text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>

        <a
          href="#top"
          className="group ml-auto inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft transition-colors hover:text-ink"
        >
          Back to top
          <ArrowUpIcon
            size={12}
            weight="bold"
            className="text-ink-faint transition-transform duration-300 group-hover:-translate-y-0.5"
          />
        </a>
      </div>
      <Wordmark />
    </footer>
  );
}
