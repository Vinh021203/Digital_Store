import type { DbReview } from './reviews';

interface MockReviewContext {
  productId: number;
  productName?: string;
  category?: string;
  technologies?: string[];
}

const REVIEWERS = [
  'Nguyễn Minh Anh',
  'Trần Quốc Huy',
  'Lê Khánh Linh',
  'Phạm Gia Bảo',
  'Võ Thu Hà',
  'Đặng Hoàng Nam',
  'Bùi Ngọc Mai',
  'Phan Minh Khang',
];

function pick<T>(items: T[], index: number) {
  return items[((index % items.length) + items.length) % items.length];
}

function getProductSeed(productId: number, productName: string) {
  let hash = Math.abs(productId) + 17;
  for (const char of productName) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2147483647;
  }
  return hash;
}

export function createProductMockReviews({
  productId,
  productName = 'mẫu giao diện này',
  category = 'website',
  technologies = [],
}: MockReviewContext): DbReview[] {
  const shortName = productName.length > 72 ? `${productName.slice(0, 69)}...` : productName;
  const techLabel = technologies.filter(Boolean).slice(0, 2).join(' và ') || 'HTML/CSS';
  const comments = [
    `Bố cục của ${shortName} rất rõ ràng, dễ hình dung khi triển khai một dự án ${category}. Các section được sắp xếp hợp lý và phần preview giúp đội ngũ duyệt giao diện nhanh hơn.`,
    `Mình đánh giá cao cách ${shortName} tổ chức component và responsive. Có sẵn nền tảng ${techLabel}, nên việc thay nội dung, màu sắc và nhận diện thương hiệu khá thuận tiện.`,
    `Sau khi xem kỹ ${shortName}, mình thích nhất phần typography và nhịp khoảng cách. Mẫu có nền tảng tốt để bắt đầu nhanh thay vì phải dựng lại toàn bộ giao diện từ đầu.`,
    `Preview của ${shortName} khá sát với trải nghiệm thực tế, tài nguyên được trình bày dễ hiểu. Một vài chi tiết vẫn cần tinh chỉnh theo thương hiệu riêng nhưng tổng thể rất chỉn chu.`,
    `Điểm cộng lớn của ${shortName} là cấu trúc dễ bàn giao. Developer có thể tiếp tục phát triển trên ${techLabel} mà không phải mất nhiều thời gian đọc lại toàn bộ bố cục.`,
    `Mẫu này phù hợp với nhu cầu làm nhanh một website ${category}. Các khu vực quan trọng đã được chuẩn bị đầy đủ, chỉ cần thay nội dung và hình ảnh là có thể trình bày với khách hàng.`,
    `Mình đã tham khảo nhiều mẫu trước đó và ${shortName} tạo cảm giác cân bằng nhất giữa thẩm mỹ và khả năng triển khai. Đây là lựa chọn đáng cân nhắc trong tầm ngân sách.`,
    `Phần responsive của ${shortName} được xử lý tốt, đặc biệt ở các khối nội dung dài. Tổng thể sạch, dễ tùy biến và phù hợp để làm nền cho một dự án thực tế.`,
  ];
  const ratings = [5, 5, 5, 4, 5, 5, 4, 5];
  const dates = [
    '2025-02-18T09:30:00.000Z',
    '2025-01-27T14:10:00.000Z',
    '2024-12-19T08:45:00.000Z',
    '2024-11-06T16:20:00.000Z',
    '2024-10-14T10:05:00.000Z',
    '2024-09-22T11:40:00.000Z',
    '2024-08-16T15:25:00.000Z',
    '2024-07-09T09:15:00.000Z',
  ];
  const productSeed = getProductSeed(productId, productName);
  const reviewCount = 5 + (productSeed % 4);
  const orderedReviewers = REVIEWERS.map((_, index) => REVIEWERS[(index + productSeed) % REVIEWERS.length]);

  return orderedReviewers.slice(0, reviewCount).map((name, index) => {
    const reviewDate = new Date(dates[index]);
    reviewDate.setDate(reviewDate.getDate() - (productSeed % 23));

    return {
      id: -(productId * 10 + index + 1),
      product_id: productId,
      user_id: `mock-reviewer-${productId}-${index + 1}`,
      rating: pick(ratings, productSeed + index),
      comment: pick(comments, productSeed + index),
      helpful_count: 3 + ((productSeed + index * 3) % 12),
      is_verified_purchase: false,
      is_approved: true,
      created_at: reviewDate.toISOString(),
      updated_at: reviewDate.toISOString(),
      user: {
        id: `mock-reviewer-${productId}-${index + 1}`,
        name,
        avatar: '',
      },
    };
  });
}

export function getMockReviewStats(reviews: DbReview[]) {
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) distribution[review.rating - 1] += 1;
  });
  const average = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  return { average, total: reviews.length, distribution };
}
