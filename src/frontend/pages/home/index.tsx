import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Component() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 lg:px-6">
        <a className="flex items-center justify-center" href="#">
          <ShoppingCart className="size-6" />
          <span className="sr-only">Acme Store</span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
            Products
          </a>
          <a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
            Categories
          </a>
          <a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
            About
          </a>
          <a className="text-sm font-medium underline-offset-4 hover:underline" href="#">
            Contact
          </a>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full bg-black py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to Acme Store
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-300 md:text-xl">
                  Discover amazing products at unbeatable prices. Shop now and transform your lifestyle!
                </p>
              </div>
              <div className="space-x-4">
                <Button>Shop Now</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-100 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="mb-8 text-center text-3xl font-bold tracking-tighter sm:text-5xl">Featured Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div className="group relative overflow-hidden rounded-lg shadow-lg" key={i}>
                  <img
                    alt={`Product ${i}`}
                    className="h-60 w-full object-cover transition-transform group-hover:scale-105"
                    height={300}
                    src={`https://g-1bd1d1i5ify.vusercontent.net/placeholder.svg?height=300&width=300`}
                    width={300}
                  />
                  <div className="bg-white p-4">
                    <h3 className="mb-2 text-lg font-semibold">Product Name</h3>
                    <p className="text-gray-600">$99.99</p>
                    <Button className="mt-2 w-full">Add to Cart</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-800 py-12 text-white md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Join Our Newsletter</h2>
                <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl">
                  Stay updated with our latest offers and products. Subscribe now!
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2">
                  <Input className="max-w-lg flex-1 bg-gray-700 text-white" placeholder="Enter your email" type="email" />
                  <Button type="submit">Subscribe</Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500">© 2024 Acme Store. All rights reserved.</p>
        <nav className="flex gap-4 sm:ml-auto sm:gap-6">
          <a className="text-xs underline-offset-4 hover:underline" href="#">
            Terms of Service
          </a>
          <a className="text-xs underline-offset-4 hover:underline" href="#">
            Privacy
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <a className="text-gray-500 hover:text-gray-700" href="#">
            <Facebook className="size-6" />
            <span className="sr-only">Facebook</span>
          </a>
          <a className="text-gray-500 hover:text-gray-700" href="#">
            <Twitter className="size-6" />
            <span className="sr-only">Twitter</span>
          </a>
          <a className="text-gray-500 hover:text-gray-700" href="#">
            <Instagram className="size-6" />
            <span className="sr-only">Instagram</span>
          </a>
        </div>
      </footer>
    </div>
  )
}