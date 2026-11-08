import Legal from '../components/layout/Legal';
export default () => <Legal title="Terms and Conditions" path="/terms" intro="The terms that apply when you book or join a Joyhimalaya trek."
  sections={[['Bookings', 'A booking request is confirmed only after we contact you and receive the agreed payment.'],
    ['Fitness and health', 'You must be medically fit for the trek you choose and share any relevant health conditions with the trek leader.'],
    ['Safety and itinerary changes', 'Weather, safety or government restrictions may change the itinerary. The trek leader’s decisions on safety are final.'],
    ['Conduct', 'Follow the leader’s instructions and respect local culture and the environment.']]} />;
