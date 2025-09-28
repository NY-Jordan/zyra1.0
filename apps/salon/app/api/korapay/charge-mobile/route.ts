import { NextRequest, NextResponse } from 'next/server'

// Configuration Korapay
const KORAPAY_SECRET_KEY = process.env.KORAPAY_SECRET_KEY
const KORAPAY_PUBLIC_KEY = process.env.KORAPAY_PUBLIC_KEY
const KORAPAY_BASE_URL = 'https://api.korapay.com/merchant/api/v1'

export async function POST(request: NextRequest) {
  try {
    const { 
      reference, 
      mobile_money, 
      amount, 
      currency = 'NGN', 
      userId, 
      packageId,
      customer,
      metadata 
    } = await request.json()

    // Validation des données
    if (!reference || !mobile_money || !amount || !customer) {
      return NextResponse.json(
        { error: 'Données manquantes pour le paiement Mobile Money' },
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

    // Préparer le body pour Korapay Mobile Money selon la nouvelle structure
    const korapayPayload = {
      amount: amount,
      currency: currency,
      reference: reference,
      description: `Paiement ${metadata?.packageName || 'Zyra'} - ${metadata?.billingPeriod || 'subscription'}`,
      notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/korapay`,
      redirect_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      customer: {
        name: customer.name,
        email: customer.email
      },
      merchant_bears_cost: true,
      mobile_money: {
        number: mobile_money.number || mobile_money.phone_number // Support ancien et nouveau format
      }
    }

    console.log('Korapay Mobile Money Payload:', korapayPayload);

    // Effectuer le paiement Mobile Money avec Korapay
    const korapayResponse = await fetch(`${KORAPAY_BASE_URL}/charges/mobile_money`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KORAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify(korapayPayload)
    })

    const korapayData = await korapayResponse.json()
    console.log('Korapay Mobile Money Response:', korapayData)

    if (!korapayResponse.ok) {
      console.error('Korapay Mobile Money Error:', korapayData)
      return NextResponse.json(
        { error: korapayData.message || 'Erreur lors du paiement Mobile Money' },
        { status: 500 }
      )
    }

    // Enregistrer la transaction avec métadonnées internes
    const transactionData = {
      userId,
      packageId,
      korapayReference: reference,
      amount: amount,
      currency: currency,
      paymentMethod: 'mobile_money',
      phoneNumber: mobile_money.number || mobile_money.phone_number,
      status: korapayData.status || 'processing',
      korapayData: korapayData,
      internalRef: `ZYRA-MOBILE-${packageId}-${userId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        billingPeriod: metadata?.billingPeriod,
        packageName: metadata?.packageName,
        ...metadata
      }
    }

    // TODO: Implémenter la sauvegarde en base de données
    console.log('Transaction Mobile Money réussie:', transactionData)

    // TODO: Activer l'abonnement si le paiement est réussi
    if (korapayData.status === 'success') {
      console.log(`Activation abonnement pour user ${userId}, package ${packageId}`)
    }

    return NextResponse.json({
      status: korapayData.status,
      transactionId: reference,
      message: 'Paiement Mobile Money traité',
      data: korapayData,
      instructions: korapayData.response_message // Instructions pour l'utilisateur
    })

  } catch (error) {
    console.error('Mobile Money Payment Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors du paiement Mobile Money' },
      { status: 500 }
    )
  }
}
