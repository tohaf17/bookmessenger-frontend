import BookDetails from '@/components/books/BookDetails';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookDetailsPage({ params }: PageProps) {
  return <BookDetails params={params} />;
}
