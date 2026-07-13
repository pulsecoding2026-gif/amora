export type ProductCategory = 'Vibradores' | 'Lingerie' | 'Cosméticos' | 'Casais' | 'Acessórios';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Vibrador Ponto G Íntimo',
    category: 'Vibradores',
    price: 249.90,
    description: 'Design ergonômico para estimular os pontos mais sensíveis, proporcionando experiências profundas e inesquecíveis.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692273728-1-produto-1.jpg',
  },
  {
    id: '2',
    name: 'Corselet de Renda Tentação',
    category: 'Lingerie',
    price: 189.50,
    description: 'Peça sofisticada em renda delicada, desenhada para realçar a silhueta com elegância e mistério.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692273723-2-produto-2.jpg',
  },
  {
    id: '3',
    name: 'Óleo de Massagem Beijo da Sedução',
    category: 'Cosméticos',
    price: 75.00,
    description: 'Com óleos naturais e aroma afrodisíaco, perfeito para massagens sensoriais que despertam os sentidos.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692273787-3-produto-3.jpg',
  },
  {
    id: '4',
    name: 'Algemas de Pulso Aveludadas Love',
    category: 'Casais',
    price: 110.00,
    description: 'Confeccionadas em veludo macio, ideais para explorar novas dinâmicas a dois com conforto e segurança.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692274516-4-produto-4.jpg',
  },
  {
    id: '5',
    name: 'Anel Peniano Vibra Intenso',
    category: 'Vibradores',
    price: 160.00,
    description: 'Projetado para intensificar o prazer masculino e feminino, com vibrações potentes e ajustáveis.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692274341-5-produto-5.jpg',
  },
  {
    id: '6',
    name: 'Máscara de Olhos em Seda Negra',
    category: 'Acessórios',
    price: 65.00,
    description: 'Feita em seda pura, proporciona um toque suave e envolvente, ideal para jogos de sedução e mistério.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692273773-6-produto-6.jpg',
  },
  {
    id: '7',
    name: 'Kit Experiência para Casais Amora',
    category: 'Casais',
    price: 299.00,
    description: 'Uma seleção curada de itens para apimentar a intimidade e descobrir novos caminhos para o prazer compartilhado.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692274516-4-produto-4.jpg',
  },
  {
    id: '8',
    name: 'Gel Lubrificante Íntimo Essencial',
    category: 'Cosméticos',
    price: 45.00,
    description: 'Fórmula à base de água, pensado para conforto e suavidade em todos os momentos, sem perder a naturalidade.',
    image: 'https://lnrfqwznkoixhjqdikqa.supabase.co/storage/v1/object/public/app-uploads/projects/a8b20a27-a24e-4999-a50a-1c4273c858bc/genimg/1783692273787-3-produto-3.jpg',
  },
];

export const categories = [
  'Vibradores',
  'Lingerie',
  'Cosméticos',
  'Casais',
  'Acessórios',
];