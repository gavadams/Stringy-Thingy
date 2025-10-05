"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import Link from "next/link";

const products = [
  {
    name: "Starter Kit",
    price: "£24.99",
    frameSize: "10\" Frame",
    pegs: "150 Pegs",
    lines: "2000 Lines",
    time: "3-4 Hours",
    features: [
      "Pre-cut wooden frame",
      "Numbered pegs & notches", 
      "Premium cotton string",
      "Online pattern generator",
      "Step-by-step instructions",
      "Digital guide included"
    ],
    popular: false,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Standard Kit",
    price: "£34.99", 
    frameSize: "12\" Frame",
    pegs: "200 Pegs",
    lines: "3000 Lines",
    time: "4-6 Hours",
    features: [
      "Pre-cut wooden frame",
      "Numbered pegs & notches",
      "Premium cotton string", 
      "Online pattern generator",
      "Step-by-step instructions",
      "Digital guide included",
      "Extra string colors",
      "Premium finishing kit"
    ],
    popular: true,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Premium Kit",
    price: "£49.99",
    frameSize: "16\" Frame", 
    pegs: "250 Pegs",
    lines: "4000 Lines",
    time: "6-8 Hours",
    features: [
      "Pre-cut wooden frame",
      "Numbered pegs & notches",
      "Premium cotton string",
      "Online pattern generator", 
      "Step-by-step instructions",
      "Digital guide included",
      "Extra string colors",
      "Premium finishing kit",
      "Display stand included",
      "Gift packaging"
    ],
    popular: false,
    gradient: "from-orange-500 to-red-500",
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Kit
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Each kit includes everything you need to create beautiful string art. 
            Perfect for beginners and experienced crafters alike.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative group ${product.popular ? 'md:-mt-8' : ''}`}
            >
              {/* Popular Badge */}
              {product.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <div className={`relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                product.popular 
                  ? 'border-purple-200 ring-2 ring-purple-100' 
                  : 'border-gray-100 hover:border-purple-200'
              }`}>
                {/* Gradient Border */}
                <div className={`absolute inset-0 bg-gradient-to-r ${product.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 mb-4">
                    {product.price}
                  </div>
                  
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-semibold">{product.frameSize}</div>
                      <div className="text-xs">Frame Size</div>
                    </div>
                    <div>
                      <div className="font-semibold">{product.pegs}</div>
                      <div className="text-xs">Pegs</div>
                    </div>
                    <div>
                      <div className="font-semibold">{product.lines}</div>
                      <div className="text-xs">Max Lines</div>
                    </div>
                    <div>
                      <div className="font-semibold">{product.time}</div>
                      <div className="text-xs">Est. Time</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {product.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: featureIndex * 0.05 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3"
                    >
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    className={`w-full py-4 text-lg font-semibold ${
                      product.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    <Link href="/shop">
                      Buy Now
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            All kits include free shipping and 30-day money-back guarantee
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Free Shipping
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              30-Day Guarantee
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Digital Instructions
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
