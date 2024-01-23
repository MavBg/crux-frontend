import {
  addPaymentInstrumentBalance,
  createPaymentInstrument,
  findPaymentInstruments,
  getPaymentInstrument,
} from "@server/services/subscription/paymentInstrument";
import {
  createSubscription,
  findSubscriptions,
  getSubscription,
  renewSubscription,
} from "@server/services/subscription/subscription";
import { createTRPCRouter, protectedProcedure } from "@server/trpc";
import { z } from "zod";

export const subscriptionRouter = createTRPCRouter({
  // Find Stuff
  findPaymentInstruments: protectedProcedure.query(async ({ ctx }) => {
    const paymentInstruments = await findPaymentInstruments(
      ctx.session.user.id
    );
    return paymentInstruments;
  }),
  findSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const subscriptions = await findSubscriptions(ctx.session.user.id);
    return subscriptions;
  }),
  // Payment Instruments
  getPaymentInstrument: protectedProcedure
    .input(
      z.object({
        paymentInstrumentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const paymentInstrumentId = input.paymentInstrumentId;
      const userId = ctx.session.user.id;
      const paymentInstrument = await getPaymentInstrument(paymentInstrumentId);
      if (paymentInstrument.userId !== userId) {
        throw new Error(
          `User ${userId} not authorized to access PaymentInstrument ${paymentInstrumentId}.`
        );
      }
      return paymentInstrument;
    }),
  createPaymentInstrument: protectedProcedure
    .input(z.object({ tokenId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const paymentInstrument = await createPaymentInstrument({
        userId: ctx.session.user.id,
        tokenId: input.tokenId ?? null,
      });
      return paymentInstrument;
    }),
  addPaymentInstrumentBalance: protectedProcedure
    .input(
      z.object({
        paymentInstrumentId: z.string(),
        address: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const paymentInstrumentId = input.paymentInstrumentId;
      const userId = ctx.session.user.id;
      const paymentInstrument = await getPaymentInstrument(paymentInstrumentId);
      if (paymentInstrument.userId !== userId) {
        throw new Error(
          `User ${userId} not authorized to access PaymentInstrument ${paymentInstrumentId}.`
        );
      }
      const result = await addPaymentInstrumentBalance({
        paymentInstrumentId: paymentInstrumentId,
        address: input.address,
        amount: input.amount,
      });
      return result;
    }),
  // Subscriptions
  getSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const subscriptionId = input.subscriptionId;
      const userId = ctx.session.user.id;
      const subscription = await getSubscription(subscriptionId);
      if (subscription.userId !== userId) {
        throw new Error(
          `User ${userId} not authorized to access Subscription ${subscriptionId}.`
        );
      }
      return subscription;
    }),
  createSubscription: protectedProcedure
    .input(
      z.object({
        paymentInstrumentId: z.string(),
        subscriptionConfigId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const paymentInstrumentId = input.paymentInstrumentId;
      const userId = ctx.session.user.id;
      const paymentInstrument = await getPaymentInstrument(paymentInstrumentId);
      if (paymentInstrument.userId !== userId) {
        throw new Error(
          `User ${userId} not authorized to access PaymentInstrument ${paymentInstrumentId}.`
        );
      }
      const subscription = await createSubscription({
        userId: userId,
        paymentInstrumentId: paymentInstrumentId,
        subscriptionConfigId: input.subscriptionConfigId,
      });
      return subscription;
    }),
  renewSubscription: protectedProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const subscriptionId = input.subscriptionId;
      const userId = ctx.session.user.id;
      const subscription = await getSubscription(subscriptionId);
      if (subscription.userId !== userId) {
        throw new Error(
          `User ${userId} not authorized to access Subscription ${subscriptionId}.`
        );
      }
      const result = await renewSubscription(subscriptionId);
      return result;
    }),
});
