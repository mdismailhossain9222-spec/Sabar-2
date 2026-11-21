import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

// Real products from main website's src/data/shop.ts
const PRODUCTS = [
  {
    id: "black-swan",
    name: "The Black Swan",
    price: 1000,
    category: "Eveningwear",
    colour: "Noir silk",
    image: "/The Black Swan.png",
    imageAlt: "The Black Swan — sculptural black satin evening dress",
    imageWidth: 1180,
    imageHeight: 1600,
    note: "Bias-cut liquid satin with a hand-draped neckline.",
    microcopy: "A silhouette of its own",
    description:
      "Our signature after-dark silhouette, cut on the bias so the satin moves with you. A hand-draped neckline and open back keep the line sculptural, never severe.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Signature",
  },
  {
    id: "eclat",
    name: "The Éclat",
    price: 800,
    category: "Occasion",
    colour: "Blush satin",
    image: "/The Éclat.png",
    imageAlt: "The Éclat — blush pink satin column dress with a shoulder bow",
    imageWidth: 1200,
    imageHeight: 1600,
    note: "A soft rose column, finished with a sculptural bow.",
    microcopy: "The new feminine",
    description:
      "A quiet entrance piece in blush satin. The column cut skims rather than clings, while an asymmetric shoulder bow gives The Éclat its soft, unmistakable presence.",
    sizes: ["S", "M", "L", "XL"],
    badge: "New in",
  },
  {
    id: "espresso",
    name: "The Espresso",
    price: 1500,
    category: "Tailoring",
    colour: "Espresso",
    image: "/The Espresso.png",
    imageAlt: "The Espresso — chocolate brown tailored blazer and wide-leg trousers",
    imageWidth: 1200,
    imageHeight: 1600,
    note: "Sharp, feminine tailoring in a warm chocolate palette.",
    microcopy: "The details do the talking",
    description:
      "A modern two-piece in deep chocolate. The single-breasted blazer is nipped at the waist and paired with a fluid wide-leg trouser — boardroom sharp, entirely feminine.",
    sizes: ["S", "M", "L", "XL"],
    badge: "Limited",
  },
  {
    id: "coco",
    name: "The Coco",
    price: 1800,
    category: "Tweed",
    colour: "Crème bouclé",
    image: "/The Coco.png",
    imageAlt: "The Coco — cream bouclé tweed jacket and skirt set with gold buttons",
    imageWidth: 1200,
    imageHeight: 1600,
    note: "Cream bouclé and pearl detailing, made to be kept.",
    microcopy: "An edit worth remembering",
    description:
      "A heirloom set in cream bouclé tweed, finished with pearl buttons and a softly structured shoulder. Designed to be worn together for occasions, or apart for every day.",
    sizes: ["S", "M", "L", "XL"],
    badge: null,
  },
];

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const client = getSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: "Supabase client unavailable" }, { status: 500 });
    }

    const results = [];

    for (const product of PRODUCTS) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client as any)
        .from("products")
        .upsert({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          colour: product.colour,
          image: product.image,
          imageAlt: product.imageAlt,
          imageWidth: product.imageWidth,
          imageHeight: product.imageHeight,
          note: product.note,
          microcopy: product.microcopy,
          description: product.description,
          sizes: product.sizes,
          badge: product.badge,
        }, { onConflict: 'id' });

      if (error) {
        results.push({ product: product.name, error: error.message });
      } else {
        results.push({ product: product.name, success: true });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}