import { Category } from "@/models/enum";

export const categories = [
    { 
        key: "All",
        label: "All",
        icon: "grid"
    },
    
    {
        key: Category.HandWatches,
        label: "Hand Watches",
        icon: "watch",
    },

    {
        key: Category.WallClocks,
        label: "Wall Clocks",
        icon: "clock",
    }
]