import { apiClient } from './api';
import { transformListingWithFullUrls } from '../utils/urlHelpers';

// Helper function to transform listing with full image URLs
const transformListing = (listing: any): MarketplaceListing => {
  return transformListingWithFullUrls(listing) as MarketplaceListing;
};

export interface AuctionBid {
  id: number;
  user_id: number;
  username: string;
  bid_amount: string;
  is_winning: boolean;
  created_at: string;
}

export interface MarketplaceAuction {
  id: number;
  starting_bid: string;
  reserve_price?: string;
  current_bid: string;
  bid_increment: string;
  start_time: string;
  end_time: string;
  total_bids: number;
  status: 'active' | 'ended' | 'cancelled' | 'sold';
  bids?: AuctionBid[];
}

export interface MarketplaceRaffle {
  id: number;
  ticket_price: string;
  total_tickets: number;
  tickets_sold: number;
  min_tickets_to_draw?: number;
  max_tickets_per_user?: number;
  start_time: string;
  end_time: string;
  status: 'active' | 'ended' | 'drawn' | 'cancelled';
  user_ticket_count?: number;
}

export interface MarketplaceListing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  listing_type: 'sale' | 'raffle' | 'auction';
  price: string;
  original_price?: string;
  quantity: number;
  allow_offers: boolean;
  min_offer_price?: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor' | 'for_parts';
  location_latitude: string;
  location_longitude: string;
  location_city: string;
  location_state: string;
  location_zip?: string;
  location_country: string;
  shipping_available: boolean;
  shipping_cost?: string;
  shipping_radius_miles?: number;
  local_pickup_only: boolean;
  status: 'draft' | 'active' | 'sold' | 'expired' | 'removed' | 'suspended';
  view_count: number;
  save_count: number;
  share_count: number;
  seller_username?: string;
  seller_name?: string;
  seller_image?: string;
  seller_rating?: string;
  seller_review_count?: number;
  seller_level?: string;
  seller_total_reviews?: number;
  seller_average_rating?: string;
  seller_tier?: string;
  primary_image?: string;
  media?: Array<{
    id: number;
    file_url: string;
    file_type: string;
    is_primary: boolean;
    thumbnail_url?: string;
    display_order: number;
  }>;
  media_count?: number;
  distance_miles?: string;
  is_saved?: boolean;
  auction?: MarketplaceAuction;
  raffle?: MarketplaceRaffle;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  description?: string;
  icon_url?: string;
  display_order: number;
  listing_count: number;
  is_active: boolean;
  children?: MarketplaceCategory[];
  breadcrumb?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  subcategories?: MarketplaceCategory[];
}

export interface SearchParams {
  query?: string;
  category_id?: number;
  listing_type?: 'sale' | 'raffle' | 'auction';
  min_price?: number;
  max_price?: number;
  condition?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  status?: string;
  sort_by?: 'created_at' | 'price' | 'distance' | 'popular';
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ListingResponse {
  success: boolean;
  data: MarketplaceListing[];
  pagination?: {
    page: number;
    pages: number;
    total: number;
    hasMore: boolean;
  };
}

export interface CreateListingData {
  title: string;
  description: string;
  category_id?: number;
  listing_type?: 'sale' | 'raffle' | 'auction';
  price?: number;
  original_price?: number;
  quantity?: number;
  allow_offers?: boolean;
  min_offer_price?: number;
  condition: string;
  location_latitude: number;
  location_longitude: number;
  location_city: string;
  location_state: string;
  location_zip?: string;
  shipping_available?: boolean;
  shipping_cost?: number;
  shipping_radius_miles?: number;
  local_pickup_only?: boolean;
  status?: string;
}

const marketplaceApi = {
  // Categories
  getCategories: async () => {
    const response = await apiClient.get('/marketplace/categories');
    return response.data;
  },

  getCategoryHierarchy: async () => {
    const response = await apiClient.get('/marketplace/categories/hierarchy');
    return response.data;
  },

  getCategoryBySlug: async (slug: string) => {
    const response = await apiClient.get(`/marketplace/categories/${slug}`);
    return response.data;
  },

  getPopularCategories: async (limit = 10) => {
    const response = await apiClient.get(`/marketplace/categories/popular?limit=${limit}`);
    return response.data;
  },

  searchCategories: async (query: string) => {
    const response = await apiClient.get(`/marketplace/categories/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Listings
  getListings: async (params: SearchParams = {}): Promise<ListingResponse> => {
    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/marketplace/listings?${queryString.toString()}`);
    const data = response.data;

    // Transform listings to include full image URLs
    if (data.success && data.data) {
      data.data = data.data.map(transformListing);
    }

    return data;
  },

  getListing: async (id: number) => {
    const response = await apiClient.get(`/marketplace/listings/${id}`);
    const data = response.data;

    // Transform listing to include full image URLs
    if (data.success && data.data) {
      data.data = transformListing(data.data);
    }

    return data;
  },

  getNearbyListings: async (latitude: number, longitude: number, radius = 25, limit = 20) => {
    const response = await apiClient.get(
      `/marketplace/listings/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}&limit=${limit}`
    );
    return response.data;
  },

  getMyListings: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/marketplace/listings/my-listings?${queryString.toString()}`);
    return response.data;
  },

  createListing: async (data: CreateListingData) => {
    const response = await apiClient.post('/marketplace/listings', data);
    return response.data;
  },

  updateListing: async (id: number, data: Partial<CreateListingData>) => {
    const response = await apiClient.put(`/marketplace/listings/${id}`, data);
    return response.data;
  },

  deleteListing: async (id: number) => {
    const response = await apiClient.delete(`/marketplace/listings/${id}`);
    return response.data;
  },

  // Auction methods
  placeBid: async (listingId: number, bidAmount: number, maxBidAmount?: number) => {
    const response = await apiClient.post(`/marketplace/auctions/${listingId}/bid`, {
      bid_amount: bidAmount,
      max_bid_amount: maxBidAmount
    });
    return response.data;
  },

  getAuctionBids: async (listingId: number) => {
    const response = await apiClient.get(`/marketplace/auctions/${listingId}/bids`);
    return response.data;
  },

  // Raffle methods
  buyRaffleTickets: async (listingId: number, ticketCount: number) => {
    const response = await apiClient.post(`/marketplace/raffles/${listingId}/tickets`, {
      ticket_count: ticketCount
    });
    return response.data;
  },

  getRaffleTickets: async (listingId: number) => {
    const response = await apiClient.get(`/marketplace/raffles/${listingId}/tickets`);
    return response.data;
  },

  // Saved Listings
  getSavedListings: async (params: { folder?: string; page?: number; limit?: number } = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/marketplace/saved?${queryString.toString()}`);
    return response.data;
  },

  getSavedFolders: async () => {
    const response = await apiClient.get('/marketplace/saved/folders');
    return response.data;
  },

  updateSavedFolder: async (listingId: number, folder: string) => {
    const response = await apiClient.put(`/marketplace/saved/${listingId}/folder`, { folder });
    return response.data;
  },

  updateSavedNotes: async (listingId: number, notes: string) => {
    const response = await apiClient.put(`/marketplace/saved/${listingId}/notes`, { notes });
    return response.data;
  },

  setPriceAlert: async (listingId: number, enabled: boolean, threshold?: number) => {
    const response = await apiClient.put(`/marketplace/saved/${listingId}/price-alert`, {
      enabled,
      threshold
    });
    return response.data;
  },

  saveListing: async (listingId: number, folder?: string, notes?: string) => {
    const response = await apiClient.post(`/marketplace/saved/${listingId}`, {
      folder,
      notes
    });
    return response.data;
  },

  unsaveListing: async (listingId: number) => {
    const response = await apiClient.delete(`/marketplace/saved/${listingId}`);
    return response.data;
  },

  isListingSaved: async (listingId: number) => {
    const response = await apiClient.get(`/marketplace/saved/${listingId}/status`);
    return response.data;
  },

  // Offers
  makeOffer: async (listingId: number, offerAmount: number, message?: string) => {
    const response = await apiClient.post('/marketplace/offers', {
      listing_id: listingId,
      offer_amount: offerAmount,
      message
    });
    return response.data;
  },

  getReceivedOffers: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/marketplace/offers/received?${queryString.toString()}`);
    return response.data;
  },

  getSentOffers: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryString.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/marketplace/offers/sent?${queryString.toString()}`);
    return response.data;
  },

  acceptOffer: async (offerId: number) => {
    const response = await apiClient.put(`/marketplace/offers/${offerId}/accept`);
    return response.data;
  },

  rejectOffer: async (offerId: number) => {
    const response = await apiClient.put(`/marketplace/offers/${offerId}/reject`);
    return response.data;
  },

  counterOffer: async (offerId: number, counterAmount: number, message?: string) => {
    const response = await apiClient.put(`/marketplace/offers/${offerId}/counter`, {
      counter_amount: counterAmount,
      counter_message: message
    });
    return response.data;
  },

  withdrawOffer: async (offerId: number) => {
    const response = await apiClient.put(`/marketplace/offers/${offerId}/withdraw`);
    return response.data;
  },

  acceptCounterOffer: async (offerId: number) => {
    const response = await apiClient.put(`/marketplace/offers/${offerId}/accept-counter`);
    return response.data;
  },

  rejectCounterOffer: async (offerId: number) => {
    const response = await apiClient.put(`/marketplace/offers/${offerId}/reject-counter`);
    return response.data;
  },

  // Image Upload methods
  uploadImages: async (listingId: number, images: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await apiClient.post(`/marketplace/listings/${listingId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    return response.data;
  },

  deleteImage: async (listingId: number, imageId: number) => {
    const response = await apiClient.delete(`/marketplace/listings/${listingId}/images/${imageId}`);
    return response.data;
  },

  setPrimaryImage: async (listingId: number, imageId: number) => {
    const response = await apiClient.put(`/marketplace/listings/${listingId}/images/${imageId}/primary`);
    return response.data;
  },

  reorderImages: async (listingId: number, imageOrder: number[]) => {
    const response = await apiClient.put(`/marketplace/listings/${listingId}/images/reorder`, {
      imageOrder
    });
    return response.data;
  },

  // Payment Methods
  getPaymentMethods: async () => {
    const response = await apiClient.get('/marketplace/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (paymentData: {
    type: string;
    cardNumber: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    holderName: string;
    isDefault: boolean;
  }) => {
    const response = await apiClient.post('/marketplace/payment-methods', paymentData);
    return response.data;
  },

  setDefaultPaymentMethod: async (methodId: number) => {
    const response = await apiClient.put(`/marketplace/payment-methods/${methodId}/default`);
    return response.data;
  },

  deletePaymentMethod: async (methodId: number) => {
    const response = await apiClient.delete(`/marketplace/payment-methods/${methodId}`);
    return response.data;
  },

  getDefaultPaymentMethod: async () => {
    const response = await apiClient.get('/marketplace/payment-methods/default');
    return response.data;
  },

  // Transactions
  createTransaction: async (transactionData: {
    listingId: number;
    transactionType: string;
    fulfillmentMethod: string;
    shippingAddress?: any;
  }) => {
    const response = await apiClient.post('/marketplace/transactions', transactionData);
    return response.data;
  },

  processPayment: async (transactionId: number, paymentMethodId: number) => {
    const response = await apiClient.post(`/marketplace/transactions/${transactionId}/pay`, {
      paymentMethodId
    });
    return response.data;
  },

  getTransactions: async (params?: { status?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/marketplace/transactions', { params });
    return response.data;
  },

  getTransactionById: async (transactionId: number) => {
    const response = await apiClient.get(`/marketplace/transactions/${transactionId}`);
    return response.data;
  },

  markAsShipped: async (transactionId: number, trackingNumber?: string) => {
    const response = await apiClient.put(`/marketplace/transactions/${transactionId}/ship`, {
      trackingNumber
    });
    return response.data;
  },

  confirmDelivery: async (transactionId: number) => {
    const response = await apiClient.put(`/marketplace/transactions/${transactionId}/deliver`);
    return response.data;
  },

  requestRefund: async (transactionId: number, reason: string) => {
    const response = await apiClient.post(`/marketplace/transactions/${transactionId}/refund`, {
      reason
    });
    return response.data;
  },

  getSellerStats: async () => {
    const response = await apiClient.get('/marketplace/transactions/stats/seller');
    return response.data;
  },

  // Payouts
  getSellerBalance: async () => {
    const response = await apiClient.get('/marketplace/payouts/balance');
    return response.data;
  },

  requestPayout: async (amount: number, payoutMethod: string) => {
    const response = await apiClient.post('/marketplace/payouts', {
      amount,
      payoutMethod
    });
    return response.data;
  },

  getPayouts: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/marketplace/payouts', { params });
    return response.data;
  },

  getPayoutStats: async () => {
    const response = await apiClient.get('/marketplace/payouts/stats');
    return response.data;
  },

  // Bird Marketplace
  getBirdListings: async (params?: {
    query?: string;
    species?: string;
    subspecies?: string;
    sex?: string;
    color_mutation?: string;
    temperament?: string;
    min_age_months?: number;
    max_age_months?: number;
    hand_fed?: boolean;
    dna_sexed?: boolean;
    health_certified?: boolean;
    proven_breeder?: boolean;
    can_talk?: boolean;
    min_price?: number;
    max_price?: number;
    location?: string;
    user_latitude?: number;
    user_longitude?: number;
    radius?: number;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`/marketplace/birds?${queryString.toString()}`);
    const data = response.data;

    // Transform listings to include full image URLs
    if (data.success && data.data) {
      data.data = data.data.map(transformListing);
    }

    return data;
  },

  getBirdSpecies: async () => {
    const response = await apiClient.get('/marketplace/birds/species');
    return response.data;
  },

  getBirdColors: async (species: string) => {
    const response = await apiClient.get(`/marketplace/birds/colors/${encodeURIComponent(species)}`);
    return response.data;
  },

  getBirdListing: async (id: number) => {
    const response = await apiClient.get(`/marketplace/birds/${id}`);
    const data = response.data;

    // Transform listing to include full image URLs
    if (data.success && data.data) {
      data.data = transformListing(data.data);
    }

    return data;
  },

  // Seller Ratings
  getSellerRatings: async (sellerId: number, params?: { page?: number; limit?: number }) => {
    const queryString = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryString.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`/marketplace/ratings/seller/${sellerId}?${queryString.toString()}`);
    return response.data;
  },

  createSellerRating: async (ratingData: {
    seller_id: number;
    listing_id?: number;
    transaction_id?: number;
    rating: number;
    review_title?: string;
    review_text?: string;
    communication_rating?: number;
    shipping_speed_rating?: number;
    item_as_described_rating?: number;
    packaging_rating?: number;
    bird_health_rating?: number;
    bird_temperament_accurate?: boolean;
    bird_documentation_provided?: boolean;
  }) => {
    const response = await apiClient.post('/marketplace/ratings', ratingData);
    return response.data;
  },

  respondToRating: async (ratingId: number, seller_response: string) => {
    const response = await apiClient.put(`/marketplace/ratings/${ratingId}/response`, { seller_response });
    return response.data;
  },

  flagRating: async (ratingId: number, reason: string) => {
    const response = await apiClient.post(`/marketplace/ratings/${ratingId}/flag`, { reason });
    return response.data;
  },

  getMySellerStats: async () => {
    const response = await apiClient.get('/marketplace/ratings/my-stats');
    return response.data;
  },

  // Bird Supplies
  getBirdSupplyCategories: async () => {
    const response = await apiClient.get('/marketplace/bird-supplies/categories');
    return response.data;
  },

  getBirdSupplies: async (params?: {
    query?: string;
    category?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    is_wholesale?: boolean;
    location?: string;
    user_latitude?: number;
    user_longitude?: number;
    radius?: number;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryString = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`/marketplace/bird-supplies?${queryString.toString()}`);
    const data = response.data;

    // Transform listings to include full image URLs
    if (data.success && data.data) {
      data.data = data.data.map(transformListing);
    }

    return data;
  },

  getBirdSupplyListing: async (id: number) => {
    const response = await apiClient.get(`/marketplace/bird-supplies/${id}`);
    const data = response.data;

    // Transform listing to include full image URLs
    if (data.success && data.data) {
      data.data = transformListing(data.data);
    }

    return data;
  },

  createBirdSupplyListing: async (data: {
    title: string;
    description: string;
    price: number;
    quantity?: number;
    location_city?: string;
    location_state?: string;
    location_latitude?: number;
    location_longitude?: number;
    shipping_available?: boolean;
    shipping_cost?: number;
    supply_category_id?: number;
    brand?: string;
    model?: string;
    is_wholesale?: boolean;
    minimum_order_quantity?: number;
    bulk_discount_available?: boolean;
    bulk_discount_tiers?: Array<{ qty: number; discount_pct: number }>;
    warranty_months?: number;
    // Category-specific fields
    cage_bar_spacing?: number;
    cage_material?: string;
    suitable_bird_sizes?: string[];
    food_type?: string;
    food_weight_oz?: number;
    ingredients?: string;
    suitable_species?: string[];
    toy_type?: string;
    toy_materials?: string[];
    health_product_type?: string;
  }) => {
    const response = await apiClient.post('/marketplace/bird-supplies', data);
    return response.data;
  },

  getBirdSupplyBrands: async () => {
    const response = await apiClient.get('/marketplace/bird-supplies/brands/list');
    return response.data;
  },

  // Product Q&A
  getListingQuestions: async (listingId: number, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/marketplace/listings/${listingId}/questions`, {
      params: { page, limit }
    });
    return response.data;
  },

  askQuestion: async (listingId: number, questionText: string) => {
    const response = await apiClient.post(`/marketplace/listings/${listingId}/questions`, {
      question_text: questionText
    });
    return response.data;
  },

  answerQuestion: async (questionId: number, answerText: string) => {
    const response = await apiClient.post(`/marketplace/questions/${questionId}/answers`, {
      answer_text: answerText
    });
    return response.data;
  }
};

export default marketplaceApi;
