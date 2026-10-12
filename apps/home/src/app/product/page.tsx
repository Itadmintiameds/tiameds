import Image from 'next/image';
import PageHero from '../components/ui/PageHero';
import Reveal from '../components/ui/Reveal';
import SplitText from '../components/ui/SplitText';

export interface Feature {
  id: string;
  name: string;
  subtitle: string;
  tagline?: string;
  description: string[];
  pointsTitle: string;
  points: string[];
  benefitsTitle: string;
  benefits: string[];
  imageSrc: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
}

interface ProductIndexItem {
  name: string;
  id: string;
  children: { name: string; id: string }[];
}

// "Title: description" items get their title in a heavier weight; the wording is untouched
const withLead = (text: string) => {
  const split = text.indexOf(': ');
  if (split < 1 || split > 60) return text;
  return (
    <>
      <span className="font-medium text-ink">{text.slice(0, split + 1)}</span> {text.slice(split + 2)}
    </>
  );
};

// Content from the "TiaMeds Website Changes" doc (product sections, in doc order)
const features: Feature[] = [
    {
      id: 'tiameds-one-hims',
      name: 'TiaMeds One – HIMS',
      subtitle: 'AI-Enabled Hospital Information Management System',
      tagline: 'One Intelligent Digital Ecosystem for Every Hospital Need',
      description: [
        'TiaMeds One is an integrated Hospital Information Management System designed to connect hospital operations through a unified digital platform. From patient registration and electronic medical records to clinical workflows, pharmacy, diagnostics, billing and administration, it helps healthcare organisations streamline processes, improve information accessibility and strengthen coordination across departments.',
        'Built around connected workflows and AI-assisted insights, TiaMeds One supports more efficient hospital operations while helping healthcare teams access the information they need to make informed decisions.',
      ],
      pointsTitle: 'Key Features',
      points: [
        'Patient registration and electronic medical records (EMR)',
        'OPD, IPD and appointment management',
        'Doctor and nursing workflow management',
        'Pharmacy and inventory integration',
        'Laboratory and diagnostic workflow integration',
        'Billing, insurance and claims management',
        'AI-assisted clinical insights',
        'Automated reports, dashboards and operational analytics',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Connect clinical and administrative workflows on a unified platform.',
        'Reduce information fragmentation between hospital departments.',
        'Improve visibility into patient records and hospital operations.',
        'Support better coordination between clinical, diagnostic and pharmacy teams.',
        'Enable data-driven operational decisions through reports and insights.',
      ],
      imageSrc: '',
      imageAlt: '',
      imageWidth: 0,
      imageHeight: 0,
    },
    {
      id: 'tiameds-lab',
      name: 'TiaMeds Lab',
      subtitle: 'AI-Enabled Laboratory Management & Diagnostic Reporting',
      tagline: 'From Raw Test Values to Actionable Clinical Insights',
      description: [
        'TiaMeds Lab is a digital laboratory management and reporting solution designed to connect diagnostic workflows, laboratory results, doctors and patients. It supports the laboratory process from test ordering and sample registration to result management, structured reporting and digital sign-off.',
        'Its AI-assisted observation layer helps present laboratory findings in a structured, understandable format, supporting doctors in reviewing results and helping patients better understand their reports. Clinical observations are presented as provisional insights, not as a substitute for professional medical diagnosis.',
      ],
      pointsTitle: 'Key Features',
      points: [
        'Digital test ordering and sample registration',
        'Automated sample tracking and real-time result management',
        'Structured laboratory results with reference ranges',
        'High, low and normal result alerts',
        'Support for CRP, Widal and panel-based test reporting',
        'Referring doctor and patient visit tracking',
        'Digital report access for doctors and patients',
        'Digital sign-off by a pathologist',
        'AI-assisted result and trend analysis',
        'AI-generated provisional observations and patient-friendly interpretations',
        'Suggested relevant doctor specialty',
        'Personalised care information and report-based alerts',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Digitise laboratory workflows and improve result accessibility.',
        'Present laboratory values and reference ranges in a structured format.',
        'Help doctors review relevant findings more efficiently.',
        'Make complex laboratory information easier for patients to understand.',
        'Support coordination between laboratories, referring doctors and patients.',
      ],
      imageSrc: '/lab.png',
      imageAlt: 'TiaMeds Lab interface showing sample tracking and test results.',
      imageWidth: 1903,
      imageHeight: 770,
    },
    {
      id: 'tiameds-insurance',
      name: 'TiaMeds Insurance',
      subtitle: 'Simplifying Insurance Workflows for Healthcare Providers',
      description: [
        'TiaMeds Insurance is a proposed digital module for organising hospital insurance information and supporting insurance-related workflows within the broader hospital management ecosystem. By connecting insurance documentation, billing and claims-related information, it aims to help hospital teams manage administrative processes more efficiently.',
      ],
      pointsTitle: 'Proposed Features',
      points: [
        'Patient insurance records and policy information',
        'Insurance documentation management',
        'Insurance verification workflow support',
        'Billing and insurance coordination',
        'Claims submission and status tracking',
        'Claims reports and management insights',
      ],
      benefitsTitle: 'Potential Benefits',
      benefits: [
        'Keep insurance-related patient information organised.',
        'Support coordination between billing and insurance teams.',
        'Improve visibility into claims-related documentation and status.',
        'Reduce fragmented information across administrative workflows.',
      ],
      imageSrc: '',
      imageAlt: '',
      imageWidth: 0,
      imageHeight: 0,
    },
    {
      id: 'tiameds-patient-flow',
      name: 'TiaMeds Patient Flow',
      subtitle: 'Connected Patient Workflow Management',
      tagline: 'Better Coordination Across the Patient Journey',
      description: [
        'TiaMeds Patient Flow is a proposed digital workflow module designed to support coordination across hospital departments, from registration and consultation to diagnostics and subsequent care processes.',
        'By improving visibility into patient visits and departmental workflows, the module aims to help healthcare teams coordinate activities and support a smoother patient experience.',
      ],
      pointsTitle: 'Proposed Features',
      points: [
        'Patient registration and visit tracking',
        'Appointment and consultation workflow coordination',
        'Patient movement across hospital departments',
        'Diagnostic workflow coordination',
        'Patient status visibility for authorised staff',
        'Workflow reports and operational insights',
      ],
      benefitsTitle: 'Potential Benefits',
      benefits: [
        'Improve coordination between hospital departments.',
        'Support visibility into patient visits and workflows.',
        'Help staff organise patient-related activities.',
        'Strengthen integration with the wider HIMS platform.',
      ],
      imageSrc: '',
      imageAlt: '',
      imageWidth: 0,
      imageHeight: 0,
    },
    {
      id: 'tiameds-marketplace',
      name: 'TiaMeds Marketplace',
      subtitle: 'AI-Powered B2B Pharmaceutical Marketplace',
      tagline: 'Right Medicine. Right Source. Right Price.',
      description: [
        'TiaMeds Marketplace is an AI-powered B2B pharmaceutical commerce platform designed to connect manufacturers, distributors, wholesalers, hospitals, and pharmacies through a unified digital procurement ecosystem.',
        'The platform addresses common challenges in pharmaceutical commerce, including fragmented supplier networks, manual purchase orders, paper-based documentation, limited batch and expiry visibility, and disconnected inventory information.',
        'By bringing product discovery, supplier connectivity, quotation management, compliance workflows, and order management together, TiaMeds Marketplace aims to simplify pharmaceutical procurement, improve supply chain visibility, and enable more transparent, organised, and traceable transactions.',
      ],
      pointsTitle: 'Key Features',
      points: [
        'B2B Pharmaceutical Connectivity: Connect manufacturers, distributors, wholesalers, hospitals, and pharmacies through a shared digital platform.',
        'Digital Product Catalogue: Enable product discovery, catalogue management, and SKU registration.',
        'RFQ and Price Comparison: Support requests for quotations and comparison of supplier pricing.',
        'Digital Procurement and Order Management: Streamline purchasing workflows, order processing, and transaction management.',
        'Supplier Verification Workflows: Support seller licence verification and compliance-related checks.',
        'Batch and Expiry Verification: Improve visibility into pharmaceutical batch details and expiry information.',
        'Order Fulfilment and Returns: Manage order fulfilment, delivery coordination, and returns workflows.',
        'Inventory Integration: Connect inventory information to support better procurement planning.',
        'AI-Assisted Recommendations: Provide product recommendations and supplier insights to support purchasing decisions.',
        'End-to-End Traceability: Support visibility across orders, batches, payments, and transactions.',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Connect pharmaceutical buyers and sellers through a unified digital marketplace.',
        'Reduce dependence on fragmented, manual procurement processes.',
        'Simplify product sourcing, supplier coordination, and quotation management.',
        'Improve visibility into products, suppliers, inventory, orders, and fulfilment.',
        'Support pharmaceutical compliance workflows and transaction traceability.',
        'Enable more informed purchasing decisions through AI-assisted insights.',
        'Build a more connected and efficient pharmaceutical supply chain.',
      ],
      imageSrc: '/cross-beding.png',
      imageAlt: 'TiaMeds Marketplace interface showing product details, seller pricing and batch information.',
      imageWidth: 554,
      imageHeight: 597,
    },
    {
      id: 'tiameds-pharma-inventory',
      name: 'TiaMeds Pharma Inventory',
      subtitle: 'AI-Enabled Pharmacy Inventory Management',
      tagline: 'Smarter Stock Management. Better Inventory Visibility.',
      description: [
        'TiaMeds Pharma Inventory is designed to help pharmacies manage their pharmaceutical inventory, purchasing, sales and billing through an integrated digital solution.',
        'With real-time stock visibility, batch and expiry tracking, and AI-assisted replenishment intelligence, the platform aims to help pharmacy teams maintain better inventory control and make more informed purchasing decisions.',
      ],
      pointsTitle: 'Key Features',
      points: [
        'Real-time stock management and monitoring',
        'Batch tracking and expiry management',
        'Purchase and sales management',
        'Billing and inventory integration',
        'AI-assisted reordering and stock intelligence',
        'Inventory analytics and management insights',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Improve visibility into available pharmaceutical stock.',
        'Monitor batches and expiry information more systematically.',
        'Support purchasing and sales workflows through integrated records.',
        'Make replenishment decisions using stock-related insights.',
        'Strengthen inventory oversight through reports and analytics.',
      ],
      imageSrc: '/pharma.png',
      imageAlt: 'TiaMeds Pharma Inventory interface showing purchase orders and stock management.',
      imageWidth: 1916,
      imageHeight: 858,
    },
    {
      id: 'blood-buddy',
      name: 'Blood Buddy',
      subtitle: 'AI-Enabled Blood Requirement & Blood-Bank Connectivity Platform',
      tagline: 'Connecting Blood Requirements with Relevant Blood-Bank Information',
      description: [
        'Blood Buddy is a digital platform designed to connect patients, attendants, hospitals and blood banks through a streamlined blood requirement and coordination system.',
        'The platform supports digital blood requirement registration, blood-bank availability searches, intelligent matching and location sharing. With notification and coordination features, Blood Buddy aims to help users identify relevant blood-bank information and coordinate requests more efficiently.',
      ],
      pointsTitle: 'Key Features',
      points: [
        'Digital blood requirement registration',
        'Blood-bank availability search',
        'Intelligent blood-bank matching',
        'Blood-bank details and location sharing',
        'WhatsApp notifications and alerts',
        'Patient and attendant support',
        'AI-assisted request prioritisation and routing',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Simplify the process of registering blood requirements.',
        'Help users find relevant blood-bank information.',
        'Improve coordination between patients, hospitals and blood banks.',
        'Support timely communication through notifications and alerts.',
        'Enable a more connected approach to blood requirement management.',
      ],
      imageSrc: '',
      imageAlt: '',
      imageWidth: 0,
      imageHeight: 0,
    },
    {
      id: 'tiameds-sporty-sports-fitness-app',
      name: 'TiaMeds Sporty – Sports & Fitness App',
      subtitle: 'Integrated Sports, Fitness & Wellness Platform',
      tagline: 'Play. Perform. Connect. Live Well.',
      description: [
        'TiaMeds Sporty is envisioned as a digital platform connecting sports facilities, players and communities through convenient booking and sports management tools.',
        'Building on the existing ARC Sports Zone slot-booking application, the platform provides a foundation for discovering sports facilities, checking available time slots and managing bookings. Its broader roadmap aims to bring sports, fitness, coaching, recreational activities and wellness services together within a connected digital ecosystem.',
      ],
      pointsTitle: 'Key Features',
      points: [
        'Indoor and outdoor sports facility management',
        'Sports and facility discovery',
        'Available time-slot viewing',
        'Online slot booking and booking confirmation',
        'Basic user and booking management',
        'Fitness and training programme support',
        'Sports coaching and skill development',
        'Tournament and sporting event management',
        'Membership and facility management',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Make sports facility discovery and booking more convenient.',
        'Support digital management of sports facilities and bookings.',
        'Bring players and sporting communities closer to available facilities.',
        'Provide a foundation for future sports and wellness services.',
        'Create opportunities to expand into an integrated sports, fitness and wellness ecosystem.',
      ],
      imageSrc: '',
      imageAlt: '',
      imageWidth: 0,
      imageHeight: 0,
    },
    {
      id: 'digital-marketing-growth-solutions',
      name: 'Digital Marketing & Growth Solutions',
      subtitle: 'AI-Powered Digital Marketing Solutions',
      tagline: 'Build Digital Visibility. Accelerate Business Growth.',
      description: [
        'Our Digital Marketing & Growth Solutions help businesses strengthen their online presence, reach relevant audiences and improve marketing performance through strategic planning, data-driven campaigns and continuous optimisation.',
        'From search visibility and paid advertising to social media, content and performance analytics, we focus on building a connected digital growth strategy aligned with business objectives.',
      ],
      pointsTitle: 'Key Services',
      points: [
        'Search Engine Optimisation (SEO)',
        'Answer Engine Optimisation (AEO) and Generative Engine Optimisation (GEO)',
        'Google Ads and Meta Ads campaign management',
        'Social media strategy and content marketing',
        'Website optimisation and conversion improvement',
        'Campaign performance tracking and analytics',
        'Lead generation and conversion optimisation',
      ],
      benefitsTitle: 'Key Benefits',
      benefits: [
        'Strengthen digital visibility across relevant search and social platforms.',
        'Reach target audiences through strategic advertising campaigns.',
        'Improve website performance and conversion opportunities.',
        'Measure campaign effectiveness through performance analytics.',
        'Make informed marketing decisions through ongoing optimisation.',
      ],
      imageSrc: '',
      imageAlt: '',
      imageWidth: 0,
      imageHeight: 0,
    },
];

// The doc's product list; sub-products link to their section (list-only entries point to their parent)
const productIndex: ProductIndexItem[] = [
    {
      name: 'TiaMeds One – HIMS',
      id: 'tiameds-one-hims',
      children: [
        { name: 'TiaMeds Lab', id: 'tiameds-lab' },
        { name: 'TiaMeds Insurance', id: 'tiameds-insurance' },
        { name: 'TiaMeds Patient Flow', id: 'tiameds-patient-flow' },
        { name: 'TiaMeds EMR and integrated hospital workflows', id: 'tiameds-one-hims' },
      ],
    },
    {
      name: 'TiaMeds Marketplace',
      id: 'tiameds-marketplace',
      children: [
        { name: 'TiaMeds Pharma Inventory', id: 'tiameds-pharma-inventory' },
        { name: 'TiaMeds Pharma Marketplace', id: 'tiameds-marketplace' },
      ],
    },
    {
      name: 'Blood Buddy',
      id: 'blood-buddy',
      children: [],
    },
    {
      name: 'TiaMeds Sporty – Sports & Fitness App',
      id: 'tiameds-sporty-sports-fitness-app',
      children: [],
    },
    {
      name: 'Digital Marketing & Growth Solutions',
      id: 'digital-marketing-growth-solutions',
      children: [],
    },
];

const ProductFeaturesPage = () => {
  return (
    <>
      <PageHero
        eyebrow="Professional Solutions"
        title={'Transform Your Business With\n*Specialized Software*'}
        lede="Powerful tools designed to optimize your operations and drive growth."
      />

      <section className="border-t border-edge/10 pb-[clamp(88px,11vw,160px)] pt-16 sm:pt-20">
        <div className="container-x lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
          <aside className="hidden lg:block">
            <nav aria-label="Products" className="sticky top-[calc(var(--header-h)+32px)]">
              <p className="eyebrow mb-7">
                <span className="eyebrow-dot" aria-hidden="true" />
                Products
              </p>
              <ul className="space-y-5 text-sm">
                {productIndex.map((group) => (
                  <li key={group.name}>
                    <a href={`#${group.id}`} className="link-sweep text-ink transition-colors hover:text-signal">
                      {group.name}
                    </a>
                    {group.children.length > 0 && (
                      <ul className="mt-2.5 space-y-2 border-l border-edge/10 pl-3.5">
                        {group.children.map((child) => (
                          <li key={child.name}>
                            <a href={`#${child.id}`} className="text-faint transition-colors hover:text-ink">
                              {child.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="min-w-0">
            {features.map((feature, index) => (
              <section
                key={feature.id}
                id={feature.id}
                className="scroll-mt-28 border-t border-edge/10 py-14 first:border-t-0 first:pt-0 last:pb-0 sm:py-20"
              >
                <p className="mono-num mb-6 text-xs text-faint">
                  {String(index + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}
                </p>
                <SplitText as="h2" text={feature.name} className="h-sub max-w-[22ch]" />
                <Reveal as="p" delay={80} className="mt-4 text-sm font-medium text-signal">
                  {feature.subtitle}
                </Reveal>
                {feature.tagline && (
                  <Reveal as="p" delay={140} className="em mt-8 block text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-ink">
                    {feature.tagline}
                  </Reveal>
                )}
                <Reveal delay={180} className={`${feature.tagline ? 'mt-5' : 'mt-8'} max-w-2xl space-y-4 text-[1.02rem] leading-relaxed text-mute`}>
                  {feature.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </Reveal>

                {feature.imageSrc && (
                  <Reveal
                    as="figure"
                    type="clip"
                    className={`mt-10 overflow-hidden rounded-2xl border border-edge/10 bg-surface p-2 ${
                      feature.imageWidth / feature.imageHeight < 1.5 ? 'max-w-sm' : ''
                    }`}
                  >
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      width={feature.imageWidth}
                      height={feature.imageHeight}
                      sizes="(min-width: 1024px) 760px, 100vw"
                      className="h-auto w-full rounded-xl"
                    />
                  </Reveal>
                )}

                <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-12">
                  <Reveal>
                    <h3 className="eyebrow">{feature.pointsTitle}</h3>
                    <ul className="mt-5 hairline-list">
                      {feature.points.map((point) => (
                        <li key={point} className="py-3 text-[0.95rem] leading-6 text-ink/80">
                          {withLead(point)}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  <Reveal delay={100}>
                    <h3 className="eyebrow">{feature.benefitsTitle}</h3>
                    <ul className="mt-5 hairline-list">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="py-3 text-[0.95rem] leading-6 text-ink/80">
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductFeaturesPage
