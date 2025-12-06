import { Star, Clock, DollarSign } from "lucide-react"

const restaurants = [
  {
    id: 1,
    name: "Sushi Master",
    image: "/elegant-sushi-restaurant-food.jpg",
    rating: 4.8,
    reviews: 324,
    deliveryTime: "25-35",
    deliveryFee: 2.99,
    cuisine: "Japanese",
    priceLevel: 2,
  },
  {
    id: 2,
    name: "Pizza Palace",
    image: "/wood-fired-pizza-restaurant.jpg",
    rating: 4.6,
    reviews: 512,
    deliveryTime: "20-30",
    deliveryFee: 0,
    cuisine: "Italian",
    priceLevel: 1,
  },
  {
    id: 3,
    name: "Burger Barn",
    image: "/gourmet-burger-restaurant-food.jpg",
    rating: 4.7,
    reviews: 289,
    deliveryTime: "15-25",
    deliveryFee: 1.99,
    cuisine: "American",
    priceLevel: 2,
  },
  {
    id: 4,
    name: "Taco Town",
    image: "/authentic-mexican-tacos-food.jpg",
    rating: 4.5,
    reviews: 198,
    deliveryTime: "20-30",
    deliveryFee: 2.49,
    cuisine: "Mexican",
    priceLevel: 1,
  },
  {
    id: 5,
    name: "Green Bowl",
    image: "/healthy-salad-bowl-restaurant.png",
    rating: 4.9,
    reviews: 156,
    deliveryTime: "15-25",
    deliveryFee: 3.49,
    cuisine: "Healthy",
    priceLevel: 2,
  },
  {
    id: 6,
    name: "Curry House",
    image: "/indian-curry-dishes-restaurant.jpg",
    rating: 4.7,
    reviews: 234,
    deliveryTime: "30-40",
    deliveryFee: 1.99,
    cuisine: "Indian",
    priceLevel: 2,
  },
]

export function RestaurantGrid() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Popular near you</h2>
          <button className="text-sm font-medium text-primary hover:underline">See all</button>
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
    <div className="group cursor-pointer overflow-hidden rounded-xl bg-card border border-border transition-shadow hover:shadow-lg">
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
    </div>
  )
}
