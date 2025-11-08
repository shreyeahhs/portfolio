export interface Project {
  title: string;
  slug: string;
  summary: string;
  year: number;
  tags: string[];
  tech: string[];
  featured?: boolean;
  links?: {
    live?: string;
    repo?: string;
    case?: string;
  };
  cover?: string;
}
