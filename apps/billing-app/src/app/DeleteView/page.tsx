"use client";
import React, { Suspense } from 'react';
import OrderSummary from '../components/OrderSummary';

const PageContent = () => {
  return (
    <>
      <OrderSummary />
    </>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

export default Page;
