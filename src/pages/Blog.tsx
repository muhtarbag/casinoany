import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: 'Bahis Sitesi Seçerken Nelere Dikkat Edilmeli?',
    description: 'Güvenilir bir bahis sitesi seçmek için bilmeniz gereken en önemli kriterler.',
    date: '15 Ocak 2025',
  },
  {
    id: 2,
    title: 'Hoş Geldin Bonusları Nasıl Kullanılır?',
    description: 'Bahis sitelerinin sunduğu bonusları en verimli şekilde kullanmanın yolları.',
    date: '12 Ocak 2025',
  },
  {
    id: 3,
    title: 'Canlı Bahis İpuçları',
    description: 'Canlı bahislerde başarılı olmak için bilmeniz gereken stratejiler.',
    date: '10 Ocak 2025',
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Bahis dünyası hakkında güncel haberler ve ipuçları
          </p>

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Card key={post.id} className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <CardDescription className="text-base">{post.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <button className="text-primary hover:underline">
                    Devamını Oku →
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
