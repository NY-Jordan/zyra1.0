'use client'
import DashboardCards from "@/presentation/components/DashboardCards";
import ReservationsChart from "@/presentation/components/ReservationsChart";
import { Building2, Users } from "lucide-react";
import ProtectedLayout from "@/presentation/layouts/ProtectedLayout";

// Données fictives pour les tableaux
const salons = [
  { name: "Salon Paris Chic", owner: "Alice", createdAt: "2025-06-20", logo: "/logo1.png", reservations: 42 },
  { name: "Barber Lyon", owner: "Bob", createdAt: "2025-06-19", logo: "/logo2.png", reservations: 38 },
  { name: "Coiffure Nice", owner: "Carla", createdAt: "2025-06-18", logo: "/logo3.png", reservations: 29 },
  { name: "Studio Marseille", owner: "David", createdAt: "2025-06-17", logo: "/logo4.png", reservations: 25 },
  { name: "Tendance Lille", owner: "Emma", createdAt: "2025-06-16", logo: "/logo5.png", reservations: 21 },
];

const reservations = [
  { client: "Lucas", clientAvatar: "", salon: "Salon Paris Chic", date: "2025-06-21" },
  { client: "Sophie", clientAvatar: "", salon: "Barber Lyon", date: "2025-06-21" },
  { client: "Paul", clientAvatar: "", salon: "Coiffure Nice", date: "2025-06-20" },
  { client: "Julie", clientAvatar: "", salon: "Studio Marseille", date: "2025-06-20" },
  { client: "Antoine", clientAvatar: "", salon: "Tendance Lille", date: "2025-06-19" },
];

const users = [
  { name: "Lucas", email: "lucas@mail.com", registered: "2025-06-21", avatar: "" },
  { name: "Sophie", email: "sophie@mail.com", registered: "2025-06-21", avatar: "" },
  { name: "Paul", email: "paul@mail.com", registered: "2025-06-20", avatar: "" },
  { name: "Julie", email: "julie@mail.com", registered: "2025-06-20", avatar: "" },
  { name: "Antoine", email: "antoine@mail.com", registered: "2025-06-19", avatar: "" },
];

const avatarUrl =
  "https://images.cults3d.com/IolHctVMn5D2Z_eaCq2QWr0r_oU=/246x246/filters:no_upscale()/https://fbi.cults3d.com/uploaders/13441287/illustration-file/bec5f725-4063-4c1f-9b3c-65a8a251378c/t%C3%A9l%C3%A9chargement.png";
const reservationLogo =
  "https://media.istockphoto.com/id/1405447809/fr/vectoriel/ciseaux-et-peigne-avec-motif-et-cadre-design-pour-coiffeur-et-salon-de-beaut%C3%A9.jpg?s=612x612&w=0&k=20&c=e_I7ZqWyNOa848dmxk7LMNgaDtq_GRqEz3nuy2-cwnc=";

function TableSection({
  title,
  columns,
  data,
  icon,
  onSeeMore,
}: {
  title: string;
  columns: string[];
  data: any[];
  icon?: React.ReactNode;
  onSeeMore?: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <button
          className="text-blue-600 hover:underline hover:cursor-pointer text-sm font-medium"
          onClick={onSeeMore}
        >
          Voir plus
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-2 text-gray-600 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="px-4 py-2">
                    {val as React.ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Tableau de bord</h1>
        <DashboardCards />

        {/* Graph reservations */}
        <div className="mt-8">
          <ReservationsChart />
        </div>

        {/* Salons les plus actifs */}
        <div className="mt-8">
          <TableSection
            title="Salons les plus actifs"
            columns={["Salon", "Propriétaire", "Créé le", "Réservations"]}
            data={salons.map((s) => ({
              "Salon": (
                <span className="flex items-center gap-2">
                  <img
                    src={reservationLogo}
                    alt={s.name}
                    className="w-7 h-7 rounded-full bg-gray-100 border object-cover"
                  />
                  {s.name}
                </span>
              ),
              "Propriétaire": s.owner,
              "Créé le": s.createdAt,
              "Réservations": (
                <span className="font-semibold text-blue-700">{s.reservations}</span>
              ),
            }))}
            icon={<Building2 className="w-6 h-6 text-blue-600" />}
            onSeeMore={() => {}}
          />
        </div>

        {/* Utilisateurs et réservations en bas, côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <TableSection
            title="Les derniers clients"
            columns={["Client", "Email", "Inscrit le"]}
            data={users.map((u) => ({
              "Client": (
                <span className="flex items-center gap-2">
                  <img src={avatarUrl} alt={u.name} className="w-7 h-7 rounded-full bg-gray-100 border" />
                  {u.name}
                </span>
              ),
              "Email": u.email,
              "Inscrit le": u.registered,
            }))}
            icon={<Users className="w-6 h-6 text-yellow-500" />}
            onSeeMore={() => {}}
          />
          <TableSection
            title="Les dernières réservations"
            columns={["Client", "Salon", "Date"]}
            data={reservations.map((r) => ({
              "Client": (
                <span className="flex items-center gap-2">
                  <img src={avatarUrl} alt={r.client} className="w-7 h-7 rounded-full bg-gray-100 border" />
                  {r.client}
                </span>
              ),
              "Salon": (
                <span className="flex items-center gap-2">
                  <img src={reservationLogo} alt={r.salon} className="w-7 h-7 rounded-full bg-gray-100 border object-cover" />
                  {r.salon}
                </span>
              ),
              "Date": r.date,
            }))}
            onSeeMore={() => {}}
          />
        </div>
      </div>
    </ProtectedLayout>
  );
}
