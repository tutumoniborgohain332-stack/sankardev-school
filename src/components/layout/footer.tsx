import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20 pt-16 pb-8 border-t-4 border-accent">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-serif font-bold text-accent mb-4 drop-shadow-sm">
              শংকৰদেৱ শিশু নিকেতন মথুৰাপুৰ
            </h2>
            <h3 className="text-lg font-semibold mb-4">Sankardev Sishu Vidya Niketan Mathurapur</h3>
            <p className="max-w-md text-primary-foreground/80 leading-relaxed">
              
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-accent mb-4">Quick Links</h4>
            <ul className="space-y-2">

              <li><Link href="/academics" className="hover:text-accent transition-colors">Academics</Link></li>
              <li><Link href="/admission" className="hover:text-accent transition-colors">Admission Portal</Link></li>
              <li><Link href="/gallery" className="hover:text-accent transition-colors">Photo Gallery</Link></li>
              <li><Link href="/news" className="hover:text-accent transition-colors">News & Notices</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-accent mb-4">Contact Us</h4>
            <address className="not-italic text-primary-foreground/80 space-y-2">
              <p>Mathurapur, Assam</p>
              <p>PIN: 785689</p>
              <p className="pt-2">Phone: +91 9365526549</p>
              <p>Email: ssnmathurapur@gmail.com</p>
            </address>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Sankardev Sishu Vidya Niketan Mathurapur. All rights reserved.</p>
          <p>Under Shishu Shiksha Samiti, Assam</p>
        </div>
      </div>
    </footer>
  );
}
