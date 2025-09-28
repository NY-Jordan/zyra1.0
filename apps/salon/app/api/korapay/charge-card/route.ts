import { NextRequest, NextResponse } from 'next/server'

// Configuration Korapay
const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY
const KORAPAY_PUBLIC_KEY = process.env.KORAPAY_PUBLIC_KEY
const KORAPAY_BASE_URL = 'https://api.korapay.com/merchant/api/v1'

export async function POST(request: NextRequest) {
  try {
    const { 
      reference, 
      card, 
      amount, 
      currency = 'NGN', 
      userId, 
      packageId,
      customer,
      metadata 
    } = await request.json()

    // Validation des données
    if (!reference || !card || !amount || !customer) {
      return NextResponse.json(
        { error: 'Données manquantes pour le paiement Korapay' },
        { status: 400 }
      )
    }

    // Validation de la référence (au moins 8 caractères)
    if (reference.length < 8) {
      return NextResponse.json(
        { error: 'La référence doit avoir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Préparer le body pour Korapay selon la documentation
    const korapayPayload = {
      reference: reference, // doit avoir au moins 8 caractères
      card: {
        name: card.name || customer.name,
        number: card.number,
        cvv: card.cvv,
        expiry_month: card.expiry_month,
        expiry_year: card.expiry_year,
        pin: card.pin || "0000" // optionnel
      },
      amount: amount,
      currency: currency,
      redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      customer: {
        name: customer.name,
        email: customer.email
      },
      metadata: {
        internalRef: `ZYRA-${packageId}-${userId}`,
        userId: userId,
        packageId: packageId,
        ...metadata
      }
    }

    console.log('Korapay Payload:', korapayPayload)

    // Effectuer le paiement avec Korapay
    const korapayResponse = await fetch(`${KORAPAY_BASE_URL}/charges/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KORAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify(korapayPayload)
    })

    const korapayData = await korapayResponse.json()
    console.log('Korapay Response:', korapayData)

    if (!korapayResponse.ok) {
      console.error('Korapay Payment Error:', korapayData)
      return NextResponse.json(
        { error: korapayData.message || 'Erreur lors du paiement Korapay' },
        { status: 500 }
      )
    }

    // Enregistrer la transaction
    const transactionData = {
      userId,
      packageId,
      korapayReference: reference,
      amount: amount,
      currency: currency,
      status: korapayData.status || 'processing',
      korapayData: korapayData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // TODO: Implémenter la sauvegarde en base de données
    console.log('Transaction Korapay réussie:', transactionData)

    // TODO: Activer l'abonnement si le paiement est réussi
    if (korapayData.status === 'success') {
      // Activer l'abonnement utilisateur
      console.log(`Activation abonnement pour user ${userId}, package ${packageId}`)
    }

    return NextResponse.json({
      status: korapayData.status,
      transactionId: reference,
      message: 'Paiement Korapay traité',
      data: korapayData
    })

  } catch (error) {
    console.error('Korapay Payment Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors du paiement Korapay' },
      { status: 500 }
    )
  }
}
