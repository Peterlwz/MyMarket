import type { Category, Listing } from "@/types/listing";

export const categories: Array<Category> = [
  { id: "all", label: "全部", emoji: "精选", background: "#F2EEE5", accent: "#202427" },
  { id: "rent", label: "转租", emoji: "住", background: "#EAF1FF", accent: "#2D6CDF" },
  { id: "digital", label: "数码", emoji: "电", background: "#E9F7F6", accent: "#0F8B8D" },
  { id: "furniture", label: "家具", emoji: "家", background: "#F5ECDA", accent: "#9A6B2F" },
  { id: "appliance", label: "家电", emoji: "器", background: "#EDF2E2", accent: "#4F7A32" },
  { id: "fashion", label: "服饰", emoji: "衣", background: "#F7EAF0", accent: "#B04D73" },
  { id: "books", label: "图书", emoji: "书", background: "#ECE8FF", accent: "#6750A4" },
  { id: "daily", label: "生活用品", emoji: "用", background: "#EAF4ED", accent: "#27785D" },
  { id: "tickets", label: "票券", emoji: "票", background: "#FFF1DE", accent: "#C66B1D" },
  { id: "other", label: "其他", emoji: "杂", background: "#ECEFF1", accent: "#546A76" }
];

export const listings: Array<Listing> = [
  {
    id: "rent-001",
    type: "rent",
    title: "近地铁朝南主卧转租，带独卫",
    categoryId: "rent",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    location: "浦东新区",
    seller: {
      name: "林同学",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
      rating: 4.9
    },
    postedAt: "刚刚",
    liked: true,
    status: "active",
    monthlyRent: 4200,
    roomType: "三室一厅主卧",
    availableFrom: "7月1日",
    leaseTerm: "6个月起",
    district: "世纪公园",
    description: "房间朝南，采光稳定，步行到地铁约8分钟。公共区室友作息规律，可直接拎包入住。"
  },
  {
    id: "product-001",
    type: "product",
    title: "Sony WH-1000XM5 降噪耳机",
    categoryId: "digital",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=80",
    location: "徐汇区",
    seller: {
      name: "Mia",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80",
      rating: 4.8
    },
    postedAt: "12分钟前",
    liked: false,
    status: "active",
    price: 1299,
    originalPrice: 2399,
    condition: "轻微使用",
    pickupMethod: "自提",
    description: "国行黑色，包装和收纳盒都在，电池健康，日常通勤使用。"
  },
  {
    id: "product-002",
    type: "product",
    title: "白橡木小边桌，适合床头",
    categoryId: "furniture",
    image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=900&q=80",
    location: "静安区",
    seller: {
      name: "周周",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=240&q=80",
      rating: 4.7
    },
    postedAt: "35分钟前",
    liked: false,
    status: "active",
    price: 168,
    originalPrice: 399,
    condition: "正常使用",
    pickupMethod: "自提",
    description: "桌面有非常轻微使用痕迹，结构稳，适合床头或沙发边。"
  },
  {
    id: "rent-002",
    type: "rent",
    title: "整租一居室，采光好可短租",
    categoryId: "rent",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    location: "海淀区",
    seller: {
      name: "阿澈",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
      rating: 4.9
    },
    postedAt: "1小时前",
    liked: false,
    status: "active",
    monthlyRent: 5600,
    roomType: "一室一厅整租",
    availableFrom: "随时入住",
    leaseTerm: "3-9个月",
    district: "五道口",
    description: "楼下便利店和咖啡店齐全，带电梯，家具齐。适合实习或过渡居住。"
  },
  {
    id: "product-003",
    type: "product",
    title: "小米空气净化器 4 Pro",
    categoryId: "appliance",
    image: "https://images.unsplash.com/photo-1637611331620-51149c7ceb94?auto=format&fit=crop&w=900&q=80",
    location: "朝阳区",
    seller: {
      name: "小野",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
      rating: 4.6
    },
    postedAt: "2小时前",
    liked: true,
    status: "active",
    price: 699,
    originalPrice: 1299,
    condition: "几乎全新",
    pickupMethod: "可配送",
    description: "搬家闲置，滤芯余量充足，外观干净，没有磕碰。"
  },
  {
    id: "product-004",
    type: "product",
    title: "考研英语与政治资料一套",
    categoryId: "books",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    location: "杨浦区",
    seller: {
      name: "Hannah",
      avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=240&q=80",
      rating: 4.8
    },
    postedAt: "今天",
    liked: false,
    status: "active",
    price: 88,
    condition: "正常使用",
    pickupMethod: "自提",
    description: "包含真题、讲义和笔记，部分页有标注，适合接着复习。"
  },
  {
    id: "product-005",
    type: "product",
    title: "演唱会双人票，可小刀",
    categoryId: "tickets",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
    location: "黄浦区",
    seller: {
      name: "River",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
      rating: 4.5
    },
    postedAt: "昨天",
    liked: false,
    status: "active",
    price: 760,
    originalPrice: 960,
    condition: "几乎全新",
    pickupMethod: "可配送",
    description: "临时有事去不了，两张连座，可当面核验。"
  },
  {
    id: "product-006",
    type: "product",
    title: "通勤防水双肩包",
    categoryId: "fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    location: "长宁区",
    seller: {
      name: "Niko",
      avatar: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=240&q=80",
      rating: 4.7
    },
    postedAt: "2天前",
    liked: false,
    status: "active",
    price: 139,
    originalPrice: 329,
    condition: "轻微使用",
    pickupMethod: "可配送",
    description: "容量够放电脑和健身衣物，拉链顺滑，背负舒服。"
  }
];

export const getListingById = (id: string) => listings.find((item) => item.id === id);

export const getListingsByCategory = (categoryId: string) =>
  categoryId === "all" ? listings : listings.filter((item) => item.categoryId === categoryId);
