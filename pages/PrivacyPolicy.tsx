
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-black min-h-screen text-white pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Privacy Policy</h1>
            <div className="h-1 w-24 bg-green-500 rounded-full"></div>
          </div>

          <div className="space-y-12 text-zinc-300">
            <section className="space-y-4 bg-zinc-900/30 p-8 rounded-3xl border border-white/5">
              <p className="text-lg leading-relaxed">
                Your personal information is always kept confidential. The privacy policy is displayed on the website. The type of info collected from the customers and usage of this information is published here. We have a policy of not disclosing any information to third parties. Using our website means you have agreed to the terms and conditions of the website. It applies to the people who have not got any transactions or who have got registered to the site and had business. Personal information is mainly used to locate or contact a person. Other information like name address, phone number, fax, credit card information, financial profiles, identification number and e-mail address are also available with us and are always confidential.
              </p>
            </section>

            <div className="grid grid-cols-1 gap-8">
              <section className="space-y-6">
                <h2 className="text-2xl font-black uppercase italic flex items-center gap-3">
                  <FileText className="text-green-500" />
                  Terms Of Our Privacy Policy
                </h2>
                
                <div className="space-y-4">
                  <h3 className="text-white font-bold uppercase text-sm tracking-widest">Personal Information That We collect</h3>
                  <p className="text-sm leading-relaxed">
                    Necessary information is collected for becoming a subscriber or member of our website. Our system collects the IP address of your computer automatically. But this detail does not give information about any particular person. But Soul Stich website doesn't collect information about children.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-bold uppercase text-sm tracking-widest">Uses Of The Information Collected</h3>
                  <p className="text-sm leading-relaxed mb-4">All the personal information collected is kept confidential. The information may be used for:</p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Send news about the website",
                      "Calculate the number of visitors",
                      "Monitor the website",
                      "Know the geographical location",
                      "Contact with information",
                      "Better shopping experience",
                      "Update about recent offers"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-zinc-900 p-3 rounded-lg border border-white/5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section className="space-y-6 border-t border-white/5 pt-8">
                <p className="text-sm leading-relaxed italic">
                  Some of the personal information is shared with the courier companies like addresses/contact details. We have to give some information to vendors. This personal information helps Soul Stich to perform their duties and fulfil the order requirements. But private information cannot be accessed by unauthorised persons or organisations. 
                </p>
                
                <p className="text-sm leading-relaxed bg-zinc-900/50 p-6 rounded-2xl border-l-4 border-green-500">
                  The Company will disclose your information, including, without limitation, your name, city, state, telephone number, email address, user ID history, quoting and listing history, and complaints, to law enforcement or other government officials if it is required to do so by law, regulation or other government authority or otherwise in cooperation with an investigation of governmental authority.
                </p>

                <div className="space-y-4">
                  <h3 className="text-white font-bold uppercase text-sm tracking-widest flex items-center gap-2">
                    <Eye className="w-4 h-4 text-green-500" />
                    Cookies & Data
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Cookies are used to save your personal information on your computer. It helps to calculate the number of times you use our website. Cookies do not keep any personal data of the visitors. When the user browses, cookies are replaced according to the interests of the users. Here none of your particulars like e-mail address, telephone, name or postal address is collected. We give you a safe shopping experience. Soul Stich gives some aggregate particulars like website statics or demographics to sponsors, advertisers and other third parties. Third parties are not authorised to get any of your personal information. Soul Stich has many links to other websites. But once you leave Soul Stich website, our privacy policy ends.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
