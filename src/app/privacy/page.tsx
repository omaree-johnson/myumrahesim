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
          </ul>
          
          <hr />
          
          <h2 id="cookies">4. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="sociallogins">5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="intltransfers">6. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="inforetain">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="infominors">8. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="privacyrights">9. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="DNT">10. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="policyupdates">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="contact">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p><em>Content to be added.</em></p>
          
          <hr />
          
          <h2 id="request">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          <p><em>Content to be added.</em></p>
        </div>
      </div>
    </div>
  );
}
