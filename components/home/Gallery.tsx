"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Eye } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    src: "/api/placeholder/400/500",
    alt: "Portrait string art of a woman",
    title: "Portrait Art",
    description: "Beautiful portrait created with 2000+ lines",
    category: "Portrait",
    aspectRatio: "portrait",
  },
  {
    id: 2,
    src: "/api/placeholder/600/400",
    alt: "Landscape string art of mountains",
    title: "Mountain Landscape",
    description: "Stunning mountain scene with 3000+ lines",
    category: "Landscape",
    aspectRatio: "landscape",
  },
  {
    id: 3,
    src: "/api/placeholder/400/400",
    alt: "Pet portrait string art",
    title: "Pet Portrait",
    description: "Adorable dog portrait with 1500+ lines",
    category: "Pet",
    aspectRatio: "square",
  },
  {
    id: 4,
    src: "/api/placeholder/500/600",
    alt: "Abstract string art design",
    title: "Abstract Design",
    description: "Modern abstract pattern with 2500+ lines",
    category: "Abstract",
    aspectRatio: "portrait",
  },
  {
    id: 5,
    src: "/api/placeholder/600/300",
    alt: "City skyline string art",
    title: "City Skyline",
    description: "Urban landscape with 4000+ lines",
    category: "Urban",
    aspectRatio: "landscape",
  },
  {
    id: 6,
    src: "/api/placeholder/400/500",
    alt: "Floral string art design",
    title: "Floral Pattern",
    description: "Elegant flower design with 1800+ lines",
    category: "Nature",
    aspectRatio: "portrait",
  },
  {
    id: 7,
    src: "/api/placeholder/500/400",
    alt: "Geometric string art",
    title: "Geometric Art",
    description: "Modern geometric pattern with 2200+ lines",
    category: "Geometric",
    aspectRatio: "landscape",
  },
  {
    id: 8,
    src: "/api/placeholder/400/400",
    alt: "Family portrait string art",
    title: "Family Portrait",
    description: "Heartwarming family moment with 3000+ lines",
    category: "Family",
    aspectRatio: "square",
  },
];

export default function Gallery() {
  const [selectedItem, setSelectedItem] = useState<typeof galleryItems[0] | null>(null);

  const getGridClass = (aspectRatio: string) => {
    if (aspectRatio === "landscape") return "md:col-span-2";
    if (aspectRatio === "portrait") return "md:row-span-2";
    return "md:col-span-1";
  };

  return (
    <section className="py-20 bg-white">
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
            Gallery of Masterpieces
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our customers have created with their Stringy-Thingy kits. 
            Each piece is unique and tells a story.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative cursor-pointer ${getGridClass(item.aspectRatio)}`}
              onClick={() => setSelectedItem(item)}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                      <Eye className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600 font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                  </div>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg"
                  >
                    <Eye className="w-6 h-6 text-gray-700" />
                  </motion.div>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>

                {/* Modal Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                        <Eye className="w-12 h-12 text-purple-600" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg">{selectedItem.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedItem.category}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedItem.title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {selectedItem.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Category: {selectedItem.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">High-quality cotton string</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Custom pattern generated</span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Create Your Own
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-6">
            Ready to create your own masterpiece? Choose your kit and get started today!
          </p>
          <motion.a
            href="/shop"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Start Creating
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
