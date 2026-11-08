import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../common/ui';
import { trekService } from '../../services/trekService';
import { inr, payable } from '../../utils/format';

const schema = z.object({
  customer_name: z.string().trim().min(2, 'Enter your name').max(120),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().min(6, 'Enter a valid phone number').max(30),
  number_of_people: z.coerce.number().int().min(1, 'At least 1').max(50),
});
export default function BookingForm({ trek }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { number_of_people: 1 } });
  const people = Number(watch('number_of_people')) || 1;
  const submit = async (v) => {
    if (v.number_of_people > trek.available_seats) return toast(`Only ${trek.available_seats} seats are left.`, 'err');
    try { await trekService.book({ ...v, trek_id: trek.id, total_amount: payable(trek) * v.number_of_people }); setDone(true); toast('Booking request sent. We will contact you to confirm.'); }
    catch { toast('Could not send your booking request. Please try again.', 'err'); }
  };
  if (done) return <p className="rounded-lg bg-forest-50 p-4 text-sm text-forest-800">Thanks. Your booking request is in. We will contact you to confirm your seat and payment.</p>;
  const F = ({ n, l, ...p }) => <div><label className="label" htmlFor={`b-${n}`}>{l}</label><input id={`b-${n}`} className="input" {...p} {...register(n)} />{errors[n] && <p className="err">{errors[n].message}</p>}</div>;
  return (
    <form id="book" onSubmit={handleSubmit(submit)} className="space-y-3" noValidate>
      <F n="customer_name" l="Full name" autoComplete="name" /><F n="email" l="Email" type="email" autoComplete="email" />
      <F n="phone" l="Phone" type="tel" autoComplete="tel" /><F n="number_of_people" l="Number of people" type="number" min="1" />
      <p className="text-sm">Estimated total: <b>{inr(payable(trek) * people)}</b></p>
      <button className="btn-primary w-full" disabled={isSubmitting || trek.available_seats < 1}>{trek.available_seats < 1 ? 'Sold out' : isSubmitting ? 'Sending…' : 'Book now'}</button>
    </form>
  );
}
