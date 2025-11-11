"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        <style jsx>{`
          .privacy-content h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #1a202c;
          }
          .privacy-content h2 {
            font-size: 1.875rem;
            font-weight: bold;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            color: #2d3748;
          }
          .privacy-content h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 2rem;
            margin-bottom: 0.75rem;
            color: #2d3748;
          }
          .privacy-content p {
            margin-bottom: 1rem;
            line-height: 1.75;
            color: #4a5568;
          }
          .privacy-content strong {
            font-weight: 600;
            color: #2d3748;
          }
          .privacy-content em {
            font-style: italic;
          }
          .privacy-content ul, .privacy-content ol {
            margin-left: 2rem;
            margin-bottom: 1rem;
            color: #4a5568;
          }
          .privacy-content li {
            margin-bottom: 0.5rem;
            line-height: 1.75;
          }
          .privacy-content a {
            color: #3182ce;
            text-decoration: underline;
          }
          .privacy-content a:hover {
            color: #2c5aa0;
          }
          .privacy-content hr {
            margin: 2rem 0;
            border: 0;
            border-top: 2px solid #e2e8f0;
          }
        `}</style>
        
        <div className="privacy-content">
          <h1>PRIVACY NOTICE</h1>
          <p><strong>Last updated __________</strong></p>
          
          <hr />
          
          <p>This Privacy Notice for __________ ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"), describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>"), including when you:</p>
          
          <p><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.</p>
          
          <hr />
          
          <h2>SUMMARY OF KEY POINTS</h2>
          
          <p><em><strong>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our <a href="#toc">table of contents</a> below to find the section you are looking for.</strong></em></p>
          
          <p><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about <a href="#personalinfo">personal information you disclose to us</a>.</p>
          
          <p><strong>Do we process any sensitive personal information?</strong> Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.</p>
          
          <p><strong>Do we collect any information from third parties?</strong> We may collect information from public databases, marketing partners, social media platforms, and other outside sources. Learn more about <a href="#othersources">information collected from other sources</a>.</p>
          
          <p><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about <a href="#infouse">how we process your information</a>.</p>
          
          <p><strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about <a href="#whoshare">when and with whom we share your personal information</a>.</p>
          
          <p><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about <a href="#privacyrights">your privacy rights</a>.</p>
          
          <p><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a <a href="https://app.termly.io/dsar/dbcbd1dc-05bc-4553-b8a1-ab670bbad194">data subject access request</a>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</p>
          
          <p>Want to learn more about what we do with any information we collect? <a href="#toc">Review the Privacy Notice in full</a>.</p>
          
          <hr />
          
          <h2 id="toc">TABLE OF CONTENTS</h2>
          
          <ol>
            <li><a href="#infocollect">WHAT INFORMATION DO WE COLLECT?</a></li>
            <li><a href="#infouse">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
            <li><a href="#whoshare">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
            <li><a href="#cookies">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
            <li><a href="#sociallogins">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></li>
            <li><a href="#intltransfers">IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</a></li>
            <li><a href="#inforetain">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
            <li><a href="#infominors">DO WE COLLECT INFORMATION FROM MINORS?</a></li>
            <li><a href="#privacyrights">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
            <li><a href="#DNT">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
            <li><a href="#policyupdates">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
            <li><a href="#contact">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
            <li><a href="#request">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></li>
          </ol>
          
          <hr />
          
          <h2 id="infocollect">1. WHAT INFORMATION DO WE COLLECT?</h2>
          
          <h3 id="personalinfo">Personal information you disclose to us</h3>
          
          <p><em><strong>In Short:</strong> We collect personal information that you provide to us.</em></p>
          
          <p>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
          
          <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>
          
          <p>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>
          
          <h3>Information automatically collected</h3>
          
          <p><em><strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></p>
          
          <p>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</p>
          
          <p>Like many businesses, we also collect information through cookies and similar technologies.</p>
          
          <hr />
          
          <h2 id="infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
          
          <p><em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.</em></p>
          
          <p><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong></p>
          
          <hr />
          
          <h2 id="whoshare">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
          
          <p><em><strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.</em></p>
          
          <p>We may need to share your personal information in the following situations:</p>
          
          <ul>
            <li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li><strong>Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.</li>
            <li><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
            <li><strong>Other Users.</strong> When you share personal information (for example, by posting comments, contributions, or other content to the Services) or otherwise interact with public areas of the Services, such personal information may be viewed by all users and may be publicly made available outside the Services in perpetuity. If you interact with other users of our Services and register for our Services through a social network (such as Facebook), your contacts on the social network will see your name, profile photo, and descriptions of your activity. Similarly, other users will be able to view descriptions of your activity, communicate with you within our Services, and view your profile.</li>
            <li><strong>Offer Wall.</strong> Our application(s) may display a third-party hosted "offer wall." Such an offer wall allows third-party advertisers to offer virtual currency, gifts, or other items to users in return for acceptance and completion of an advertisement offer. Such an offer wall may appear in our application(s) and be displayed to you based on certain data, such as your geographic area or demographic information. When you click on an offer wall, you will be brought to an external website belonging to other persons and will leave our application(s). A unique identifier, such as your user ID, will be shared with the offer wall provider in order to prevent fraud and properly credit your account with the relevant reward.</li>
          </ul>
          
          <hr />
          
          <h2 id="cookies">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          
          <p><em><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</em></p>
          
          <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice.</p>
          
          <hr />
          
          <h2 id="sociallogins">5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
          
          <p><em><strong>In Short:</strong> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</em></p>
          
          <p>Our Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.</p>
          
          <p>We will use the information we receive only for the purposes that are described in this Privacy Notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps.</p>
          
          <hr />
          
          <h2 id="intltransfers">6. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h2>
          
          <p><em><strong>In Short:</strong> We may transfer, store, and process your information in countries other than your own.</em></p>
          
          <p>Our servers are located in. If you are accessing our Services from outside, please be aware that your information may be transferred to, stored, and processed by us in our facilities and by those third parties with whom we may share your personal information (see <a href="#whoshare">"WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?"</a>), in and other countries.</p>
          
          <p>If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Notice and applicable law.</p>
          
          <hr />
          
          <h2 id="inforetain">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          
          <p><em><strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</em></p>
          
          <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</p>
          
          <p>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.</p>
          
          <hr />
          
          <h2 id="infominors">8. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          
          <p><em><strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.</em></p>
          
          <p>We do not knowingly solicit data from or market to children under 18 years of age. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at.</p>
          
          <hr />
          
          <h2 id="privacyrights">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          
          <p><em><strong>In Short:</strong> In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Switzerland, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</em></p>
          
          <p>In some regions (like the EEA, UK, and Switzerland), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section <a href="#contact">"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"</a> below.</p>
          
          <p>We will consider and act upon any request in accordance with applicable data protection laws.</p>
          
          <p>If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your Member State data protection authority or UK data protection authority.</p>
          
          <p>If you are located in Switzerland, you may contact the Federal Data Protection and Information Commissioner.</p>
          
          <p><strong>Withdrawing your consent:</strong> If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section <a href="#contact">"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"</a> below.</p>
          
          <p>However, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</p>
          
          <p><strong>Opting out of marketing and promotional communications:</strong> You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, or by contacting us using the details provided in the section <a href="#contact">"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?"</a> below. You will then be removed from the marketing lists. However, we may still communicate with you—for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.</p>
          
          <h3>Account Information</h3>
          
          <p>If you would at any time like to review or change the information in your account or terminate your account, you can:</p>
          
          <ul>
            <li>Log in to your account settings and update your user account.</li>
            <li>Contact us using the contact information provided.</li>
          </ul>
          
          <p>Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</p>
          
          <p><strong>Cookies and similar technologies:</strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services.</p>
          
          <p>If you have questions or comments about your privacy rights, you may email us at.</p>
          
          <hr />
          
          <h2 id="DNT">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          
          <p>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ("DNT") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</p>
          
          <hr />
          
          <h2 id="policyupdates">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
          
          <p><em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></p>
          
          <p>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</p>
          
          <hr />
          
          <h2 id="contact">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          
          <p>If you have questions or comments about this notice, you may contact us by post at:</p>
          
          <hr />
          
          <h2 id="request">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          
          <p>Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please fill out and submit a <a href="https://app.termly.io/dsar/dbcbd1dc-05bc-4553-b8a1-ab670bbad194">data subject access request</a>.</p>
        </div>
      </div>
    </div>
  );
}
