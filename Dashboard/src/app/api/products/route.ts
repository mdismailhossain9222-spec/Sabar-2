import { NextRequest, NextResponse } from "next/server";
import { fetchProducts } from "@/lib/supabase-data";
import { INITIAL_PRODUCTS } from "@/lib/seed-data";

export async function GET() {
  try {
    const products = await fetchProducts();
    return NextResponse.json({
      products: products.length ? products : INITIAL_PRODUCTS,
    });
  } catch (error) {
    console.error("Error in GET /api/products:", error);
    return NextResponse.json({ products: INITIAL_PRODUCTS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // For now, return mock success since we don't write to products table
    return NextResponse.json({
      product: {
        id: Date.now(),
        sku: body.sku || `SBS-${Date.now()}`,
        name: body.name,
        collection: body.collection || "SS26 — Daisy Dreams",
        category: body.category || "Couture",
        price: Number(body.price || 0),
        stock: Number(body.stock || 10),
        stockStatus: "In Stock",
        image: body.image || "/images/garment-1.jpg",
        fabric: body.fabric || "Hand-finished in Dubai",
        sizes: Array.isArray(body.sizes) ? body.sizes : ["S", "M", "L"],
        description: body.description || "",
        featured: Boolean(body.featured ?? true),
      },
    });
  } catch (error) {
    console.error("Error in POST /api/products:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, stock, price, name, category, collection, fabric, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Mock update for now (products table is read-only from shared DB)
    return NextResponse.json({
      product: {
        id,
        sku: `SBS-${id}`,
        name: name || `Product ${id}`,
        collection,
        category,
        price: Number(price || 0),
        stock: Number(stock || 10),
        stockStatus: stock !== undefined ? (stock <= 0 ? "Sold Out" : stock <= 5 ? "Low Stock" : "In Stock") : "In Stock",
        image: "/images/garment-1.jpg",
        fabric: fabric || "Hand-finished in Dubai",
        sizes: ["S", "M", "L"],
        description: description || "",
        featured: false,
      },
    });
  } catch (error) {
    console.error("Error in PATCH /api/products:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/products:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}