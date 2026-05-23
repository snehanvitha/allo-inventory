"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Inventory {
  id: string;
  warehouseName: string;
  location: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  inventory: Inventory[];
}

export default function HomePage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function fetchProducts() {
    try {

      const response =
        await axios.get("/api/products");

      setProducts(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function reserveProduct(
    inventoryId: string
  ) {
    try {

      const response =
        await axios.post("/api/reservations", {
          inventoryId,
          quantity: 1,
        });

      router.push(
  `/reservation/${response.data.id}`
);

      fetchProducts();

    } catch (error: any) {

      if (
        error.response?.status === 409
      ) {
        alert("Not enough stock available");
      } else {
        alert("Failed to reserve product");
      }
    }
  }

  if (loading) {
    return (
      <div className="p-10">
        Loading products...
      </div>
    );
  }

  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Inventory Reservation System
      </h1>

      <div className="grid gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="border rounded-xl p-6 shadow"
          >

            <h2 className="text-2xl font-semibold">
              {product.name}
            </h2>

            <p className="text-gray-600 mt-2">
              {product.description}
            </p>

            <p className="mt-3 font-bold">
              ₹{product.price}
            </p>

            <div className="mt-5 grid gap-3">

              {product.inventory.map((inventory) => (

                <div
                  key={inventory.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >

                  <div>
                    <p className="font-medium">
                      {inventory.warehouseName}
                    </p>

                    <p className="text-sm text-gray-500">
                      {inventory.location}
                    </p>

                    <p className="mt-1">
                      Available Stock:
                      {" "}
                      {inventory.availableStock}
                    </p>
                  </div>

                  <button
  onClick={() =>
    reserveProduct(inventory.id)
  }

  disabled={
    inventory.availableStock <= 0
  }

  className="
    bg-black
    text-white
    px-4
    py-2
    rounded-lg
    disabled:bg-gray-400
    disabled:cursor-not-allowed
  "
>
  Reserve
</button>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </main>
  );
}