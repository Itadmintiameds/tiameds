export interface Posttype {
  id: number;
  title: string;
  href: string;
  image?: string;  // Make image optional
  description: string;
  date: string;
  datetime: string;
  category: {
    title: string;
    href: string;
  };
  author: {
    name: string;
    role: string;
    href: string;
    imageUrl: string;
  };
}
