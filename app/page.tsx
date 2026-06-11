import HomePage from '@/components/pages/HomePage';
import HomeDeferredChrome from '@/components/pages/HomeDeferredChrome';
import { Navbar, Footer } from '@/components/layout';
import MaintenanceGuard from '@/components/layout/MaintenanceGuard';
import { getHomepageData } from '@/lib/homepageData';

export default async function Page() {
    const homepageData = await getHomepageData();

    return (
        <MaintenanceGuard>
            <Navbar />

            <main className="min-h-screen" id="main-content" role="main">
                <HomePage
                    initialProducts={homepageData.products}
                    initialCategories={homepageData.categories}
                    initialBlogPosts={homepageData.blogPosts}
                />
            </main>

            <Footer />

            <HomeDeferredChrome />
        </MaintenanceGuard>
    );
}
