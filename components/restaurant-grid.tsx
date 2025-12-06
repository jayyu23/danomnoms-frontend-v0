import { Star, Clock, DollarSign } from "lucide-react"

const restaurants = [
  {
    id: 1,
    name: "Wasabi Saratoga",
    image: "/elegant-sushi-restaurant-food.jpg",
    rating: 4.8,
    reviews: 450,
    deliveryTime: "35",
    deliveryFee: 0,
    cuisine: "Japanese, Sushi",
    priceLevel: 2,
    link: "https://www.doordash.com/store/28214638/?cursor=eyJzdG9yZV9wcmltYXJ5X3ZlcnRpY2FsX2lkcyI6WzEsNCwxMDAzMzMsMTEwMDA5LDExMDAxMywxNDQsMTc3LDI4NF19&pickup=false",
  },
  {
    id: 2,
    name: "Rustic Pizza and Eats",
    image: "/wood-fired-pizza-restaurant.jpg",
    rating: 4.7,
    reviews: 320,
    deliveryTime: "30",
    deliveryFee: 0,
    cuisine: "Italian, Pizzeria",
    priceLevel: 1,
    link: "https://www.doordash.com/store/33828431/?cursor=eyJzdG9yZV9wcmltYXJ5X3ZlcnRpY2FsX2lkcyI6WzEsNCwxMDAzMzIsMTAwMzMzLDE3NV19&pickup=false",
  },
  {
    id: 3,
    name: "The Burger Den",
    image: "/gourmet-burger-restaurant-food.jpg",
    rating: 4.3,
    reviews: 200,
    deliveryTime: "38",
    deliveryFee: 0,
    cuisine: "Burgers, American",
    priceLevel: 2,
    link: "https://www.doordash.com/store/1635186/?cursor=eyJzdG9yZV9wcmltYXJ5X3ZlcnRpY2FsX2lkcyI6WzEsNCwxMDAzMzIsMTAwMzMzLDExMDAxMywxNzYsMTc3LDE5MywxOTVdfQ==&pickup=false",
  },
  {
    id: 4,
    name: "Sunny Wok",
    image: "/indian-curry-dishes-restaurant.jpg",
    rating: 4.6,
    reviews: 500,
    deliveryTime: "40",
    deliveryFee: 0,
    cuisine: "Chinese",
    priceLevel: 2,
    link: "https://www.doordash.com/store/310763/?cursor=eyJzdG9yZV9wcmltYXJ5X3ZlcnRpY2FsX2lkcyI6WzEsNCwxMDAzMzMsMTEwMDEzLDE3NiwxNzcsMTkzLDE5NV19&pickup=false",
  },
  {
    id: 5,
    name: "BUA Thai + Sushi",
    image: "/elegant-sushi-restaurant-food.jpg",
    rating: 4.6,
    reviews: 380,
    deliveryTime: "45",
    deliveryFee: 0,
    cuisine: "Thai, Sushi",
    priceLevel: 2,
    link: "https://www.doordash.com/store/349218/?cursor=eyJzdG9yZV9wcmltYXJ5X3ZlcnRpY2FsX2lkcyI6WzEsNCwxMDAzMzMsMTEwMDEzLDE3N119&pickup=false",
  },
  {
    id: 6,
    name: "Domino's",
    image: "/fresh-italian-pizza.jpg",
    rating: 4.6,
    reviews: 1200,
    deliveryTime: "25",
    deliveryFee: 0,
    cuisine: "Pizza",
    priceLevel: 1,
    link: "https://www.doordash.com/store/34238397/?cursor=eyJzdG9yZV9wcmltYXJ5X3ZlcnRpY2FsX2lkcyI6WzEsNCwxMDAzMzNdfQ==&pickup=false",
  },
]

export function RestaurantGrid() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Popular Restaurants Available</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </div>
    </section>
  )
}

function RestaurantCard({ restaurant }: { restaurant: (typeof restaurants)[0] }) {
  return (
    <a
      href={restaurant.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group cursor-pointer overflow-hidden rounded-xl bg-card border border-border transition-shadow hover:shadow-lg block"
    >
      <div className="relative overflow-hidden">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="h-44 w-full object-cover transition-transform group-hover:scale-105"
        />
        {restaurant.deliveryFee === 0 && (
          <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            Free Delivery
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground">{restaurant.name}</h3>
          <div className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {restaurant.cuisine} • {Array(restaurant.priceLevel).fill("$").join("")}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{restaurant.deliveryTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>
              {restaurant.deliveryFee === 0 ? "Free delivery" : `$${restaurant.deliveryFee.toFixed(2)} delivery`}
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}
