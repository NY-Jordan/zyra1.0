'use client'
import { Building2, Scissors, Calendar, Users } from "lucide-react"

const stats = [
	{
		icon: <Building2 className="w-8 h-8 text-blue-600" />,
		value: "235 salons",
		label: "Actifs sur la plateforme ce mois",
	},
	{
		icon: <Scissors className="w-8 h-8 text-pink-500" />,
		value: "800 coiffeurs",
		label: "Actifs sur la plateforme ce mois",
	},
	{
		icon: <Calendar className="w-8 h-8 text-green-600" />,
		value: "123 réservations",
		label: "Aujourd'hui",
	},
	{
		icon: <Users className="w-8 h-8 text-yellow-500" />,
		value: "1500 clients",
		label: "Inscrits sur la plateforme",
	},
]

export default function DashboardCards() {
	return (
		<div className="flex flex-wrap gap-6">
			{stats.map((stat) => (
				<div
					key={stat.value}
					className="bg-white rounded-xl shadow p-6 min-w-[220px] flex-1 flex flex-col"
				>
					<div className="flex items-center gap-3 text-2xl font-bold mb-2">
						{stat.icon}
						<span className="text-gray-800">{stat.value}</span>
					</div>
					<div className="text-gray-500 text-sm">{stat.label}</div>
				</div>
			))}
		</div>
	)
}