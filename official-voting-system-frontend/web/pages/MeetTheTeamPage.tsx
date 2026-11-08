// web/pages/MeetTheTeamPage.tsx
// FINAL MASTERPIECE — Clean white background + dark blue accents only

import { useState } from 'react';

type TeamMember = {
  id: string | number;
  name: string;
  position: string;
  role: string;
  imagePublicId?: string;
  imageUrl?: string;
  bio?: string;
  contact?: string;
};

const cloudinaryUrl = (publicId: string | undefined, options = '') =>
  publicId ? `https://res.cloudinary.com/unihousingmw/image/upload/${options}/${publicId}.jpg` : '';

// Your original DMI LEGEND placeholder — restored
const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMjA0YjY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiNmZmYiPkRNSSBMRUdFTkQ8L3RleHQ+PC9zdmc+';

const sampleTeam: TeamMember[] = [
  { id: 1, name: 'Angel T. Kautsi', position: 'Chairperson', role: 'Club Chair, Strategy & Outreach', imagePublicId: 'v1763505591/LILZPICS052_anvt6m', bio: '', contact: '' },
  { id: 2, name: 'Blessings Phiri', position: 'Vice Chairperson', role: 'Operations & Events', imagePublicId: 'v1763535212/WhatsApp_Image_2025-11-19_at_8.08.44_AM_fzppim', bio: 'The strongest people are not those who show strength to us, but those who win battles we know nothing about.', contact: 'blessingsphiri196@gmail.com' },
  { id: 3, name: 'Immanuel Gondwe', position: 'Secretary', role: 'Graphics Designer', imagePublicId: 'v1763505597/LILZPICS033_sgtsgs', bio: '', contact: 'immanuelgondwe0@gmail.com' },
  { id: 4, name: 'Athony Phiri', position: 'Vice Secretary', role: 'Backend Developer', imagePublicId: 'v1763505599/LILZPICS028_owmga5', bio: 'Anthony crafts the club visual identity and ensures accessible, emotional design.', contact: '' },
  { id: 5, name: 'Jane Alex', position: 'Project Coordinator', role: 'Project Coordinator', imagePublicId: 'v1763535212/WhatsApp_Image_2025-11-19_at_8.48.06_AM_zwwmkk', bio: 'Finding success in hardship.', contact: 'Welonasi@gmail.com' },
  { id: 6, name: 'Benson Bauleni', position: 'Discipline Officer', role: 'Discipline Officer', imagePublicId: 'v1763505109/LILZPICS030_w54dao', bio: '', contact: 'baulenibenson206@gmail.com' },
  { id: 7, name: 'Yohane H. Maluwa', position: 'Comms Officer', role: 'Frontend Developer', imagePublicId: 'v1763772550/1763772181519_2_dhj4xk', bio: 'Finding residence in pixels.', contact: 'ymaluwa@outlook.com' },
  { id: 8, name: 'Emmanuel Noel Kakwera', position: 'Member', role: 'Discipline Assistant and Security Officer', imagePublicId: 'v1763770779/WhatsApp_Image_2025-11-22_at_2.15.44_AM_djtnfm', bio: '', contact: 'emmanuelkakwera4@mail.com' },
  { id: 9, name: 'Cedric Bakali', position: 'Member', role: 'Graphics designer', imagePublicId: 'v1763770783/WhatsApp_Image_2025-11-22_at_2.15.45_AM_hl7l3w', bio: '', contact: 'bakalicedric@gmail.com' },
  { id: 10, name: 'Alfred Banda', position: 'Member', role: 'Frontend & Backend Assistant - Emotional Support', imagePublicId: 'v1763770778/WhatsApp_Image_2025-11-22_at_2.15.45_AM_1_kcrd8q', bio: 'to learn, know, and act with the power of faith, hope and courage', contact: 'bandaalfred303@gmail.com' },
  { id: 11, name: 'Lester', position: 'Member', role: 'No Role Assigned', imagePublicId: '', bio: '', contact: '' },
  { id: 12, name: 'Keith Chiwaula', position: 'Member', role: 'No Role Assigned', imagePublicId: 'dmi/team/samuel_zulu', bio: '', contact: 'keithchiwaula36@gmail.com' },
  { id: 13, name: 'Adam Wasili', position: 'Member', role: 'No Role Assigned', imagePublicId: 'dmi/team/samuel_zulu', bio: '', contact: 'wasiliadam.mw@gmail.comm' },
  { id: 14, name: 'Akim Amini', position: 'Member', role: 'No Role Assigned', imagePublicId: 'v1763505104/LILZPICS056_1_nmxci7', bio: '', contact: 'akimamin@gmail.com' },
  { id: 15, name: 'Esther Masiye', position: 'Member', role: 'Voucher Distribution', imagePublicId: 'v1765185812/IMG-20251010-WA0035_aad6gw', bio: 'Graphics designer | Always learning | Creating visual stories | Passionate about branding & identity', contact: 'esthermasiye64@gmail.com' },
];

const MeetTheTeamPage: React.FC = () => {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <>
      {/* Clean white hero with dark blue & gold text */}
      <div className="bg-white py-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-dmi-blue-950">
          MEET THE TEAM
        </h1>
        <p className="mt-4 text-lg md:text-xl text-dmi-blue-700 font-light">
          Architects of Tomorrow • Legends of Today
        </p>
        <div className="mt-6 flex justify-center gap-10">
          <div className="h-px w-24 bg-dmi-blue-950"></div>
          <div className="h-px w-24 bg-dmi-gold-500"></div>
          <div className="h-px w-24 bg-dmi-blue-950"></div>
        </div>
      </div>

      {/* Pure white background gallery */}
      <div className="bg-white py-16 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {sampleTeam.map((member, i) => {
            const img = member.imageUrl || (member.imagePublicId ? cloudinaryUrl(member.imagePublicId, 'c_fill,g_face,w_800,h_800,q_auto:best') : null);

            return (
              <button
                key={member.id}
                onClick={() => setSelected(member)}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500"
                style={{ animation: 'fadeInScale 0.8s ease-out forwards', animationDelay: `${i * 70}ms`, opacity: 0 }}
              >
                <div className="aspect-[3/4] relative bg-gray-100">
                  <img
                    src={img || placeholder}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 
                               transition-all duration-700 group-hover:scale-110 group-hover:rotate-3"
                  />
                  {/* Dark overlay fade */}
                  <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all duration-700"></div>

                  {/* Clean text slide-up */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-center transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700">
                    <h3 className="text-white font-bold text-lg drop-shadow-2xl">
                      {member.name}
                    </h3>
                    <p className="text-dmi-gold-400 text-sm font-medium mt-1 drop-shadow-lg">
                      {member.position}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center mt-20 text-xl font-medium text-dmi-blue-950">
          Your Name Belongs Here —{' '}
          <span className="text-dmi-gold-600"><a
                      href={`mailto:ymaluwa@gmail.com`}
                      className="inline-block mt-6 px-8 py-3 bg-dmi-blue-950 text-white font-bold rounded-full hover:bg-dmi-blue-900 transition shadow-lg"
                    >
                      Contanct Us
                    </a>
                  </span>
        </p>
      </div>

      {/* Clean white modal with dark blue & gold */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gold accent line */}
            <div className="h-2 bg-gradient-to-r from-dmi-blue-950 via-dmi-gold-500 to-dmi-blue-950"></div>

            <div className="p-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-48 h-48 rounded-2xl overflow-hidden ring-8 ring-dmi-blue-100 shadow-xl">
                  <img
                    src={selected.imageUrl || (selected.imagePublicId ? cloudinaryUrl(selected.imagePublicId, 'c_fill,g_face,w_1000,h_1000,q_auto:best') : placeholder)}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-center md:text-left flex-1">
                  <h2 className="text-4xl font-black text-dmi-blue-950">{selected.name}</h2>
                  <p className="text-2xl text-dmi-gold-600 font-medium mt-2">{selected.position}</p>
                  <p className="text-lg text-dmi-blue-700 italic mt-1">{selected.role}</p>

                  {selected.contact && (
                    <a
                      href={`mailto:${selected.contact}`}
                      className="inline-block mt-6 px-8 py-3 bg-dmi-blue-950 text-white font-bold rounded-full hover:bg-dmi-blue-900 transition shadow-lg"
                    >
                      Contact Member
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-dmi-blue-950 mb-4">Bio</h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {selected.bio || 'This team member lets their work and dedication speak for itself.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="absolute top-6 right-6 w-12 h-12 bg-dmi-blue-950 text-white rounded-full flex items-center justify-center text-3xl hover:bg-dmi-blue-900 transition shadow-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MeetTheTeamPage;