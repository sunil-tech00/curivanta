// A client's page in the owner app, drawn (2026-11-22, from the live homepage's "Every client, one place").
// Shown on /new/owner-app ("Every client, remembered"); the homepage links to it.
const ClientCard = () => (
  <div className="nx-cl" aria-label="Sample client page in the Curivanta app">
    <div className="nx-cl-hero">
      <span className="nx-cl-back">‹ Clients</span>
      <div className="nx-cl-who"><span className="nx-cl-av">SW</span><div><b>Sarah Whitman</b><span>(949) 555-0187 · client since 2023</span></div></div>
      <div className="nx-cl-stats">
        <div><b>14</b><span>visits</span></div>
        <div><b>Jess</b><span>usual stylist</span></div>
        <div><b>Sat Oct 11</b><span>next visit</span></div>
      </div>
      <div className="nx-cl-call">Call</div>
    </div>
    <div className="nx-cl-body">
      <div className="nx-cl-filters"><span className="on">Everything</span><span>Texts</span><span>Calls</span><span>Visits</span><span>Reviews</span></div>
      <div className="nx-cl-day">Sat Oct 4</div>
      <div className="nx-cl-ev"><span className="g">✂</span><div><b>Visit: Root touch-up with Jess</b><small>10:00 AM</small></div></div>
      <div className="nx-cl-ev"><span className="a">★</span><div><b>Review request: rated 5 ★</b><small>4:12 PM · Jess · opened the Google review link</small></div></div>
      <div className="nx-cl-ev"><span className="v">G</span><div><b>Google review: ★★★★★</b><small>6:30 PM · as "Sarah W." · matched by name</small><q>Jess is the only one I trust with my color.</q><small>Your reply: Thank you, Sarah! See you next time.</small></div></div>
      <div className="nx-cl-day">Today</div>
      <div className="nx-cl-ev"><span className="r">↙</span><div><b>Missed call, texted back</b><small>8:44 PM</small></div></div>
      <p className="nx-cl-b in">Hi, do you have any availability for Saturday?</p>
      <p className="nx-cl-b out">Hi Sarah! Is it for another root touch-up with Jess, like last time? She has 10:00 or 1:30.</p>
      <p className="nx-cl-b in">10 please</p>
      <div className="nx-cl-ev"><span className="g">▦</span><div><b>Booked: Root touch-up with Jess</b><small>Sat Oct 11, 10:00 AM · booked by the assistant</small></div></div>
    </div>
    <div className="nx-cl-compose"><span>Text Sarah</span><i aria-hidden="true">➤</i></div>
  </div>
);
export default ClientCard;
