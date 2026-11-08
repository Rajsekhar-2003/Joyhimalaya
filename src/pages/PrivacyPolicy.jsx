import Legal from '../components/layout/Legal';
export default () => <Legal title="Privacy Policy" path="/privacy-policy" intro="How Joyhimalaya collects, uses and protects your personal information."
  sections={[['Information we collect', 'Name, email, phone number and message details when you contact us or request a booking.'],
    ['How we use it', 'To reply to enquiries, process bookings and share trek updates you asked for. We do not sell your data.'],
    ['Storage and security', 'Data is stored in a managed database with access limited to authorised staff.'],
    ['Your rights', 'You can ask us to correct or delete your data by emailing us at the address on the Contact page.']]} />;
