import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'

export default function Dashboard() {
  return (
    <ProtectedLayout 
      pageTitle="Tableau de bord"
      breadcrumbs={[
        { label: "Accueil", href: "/", isCurrent: false },
        { label: "Tableau de bord", isCurrent: true }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Rendez-vous aujourd'hui
          </h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Revenus du mois
          </h3>
          <p className="text-3xl font-bold text-green-600">2 450€</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Nouveaux clients
          </h3>
          <p className="text-3xl font-bold text-purple-600">8</p>
        </div>
      </div>
    </ProtectedLayout>
  )
}
