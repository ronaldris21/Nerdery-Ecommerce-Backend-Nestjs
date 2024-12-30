// Instala la librería necesaria:
// npm install react-copy-to-clipboard

import React, { useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import "./CardTable.css"; // Agrega estilos personalizados si es necesario

const CardTable = () => {
  const [copied, setCopied] = useState(false);

  const cards = [
    {
      type: "Successful",
      month: "04/26",
      number: "4242 4242 4242 4242",
      CVC: "123",
      zipcode: "30001",
    },
    {
      type: "Declined",
      month: "04/26",
      number: "4000 0000 0000 9995",
      CVC: "123",
      zipcode: "30001",
    },
    {
      type: "Invalid",
      month: "02/22",
      number: "4000 0000 0000 0069",
      CVC: "123",
      zipcode: "30001",
    },
  ];

  const handleCopy = (cardNumber) => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reinicia el estado de copiado después de 2 segundos
  };

  return (
    <div className="card-table-container">
      <h1>Stripe Test Cards</h1>
      {copied && <div className="copy-notification">Card number copied to clipboard!</div>}
      <table className="card-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Card Number</th>
            <th>Month</th>
            <th>CVC</th>
            <th>Zipcode</th>

          </tr>
        </thead>
        <tbody>
          {cards.map((card, index) => (
            <tr key={index}>
              <td className="white">{card.type}</td>
              <td>
                <CopyToClipboard text={card.number} onCopy={() => handleCopy(card.number)}>
                  <button className="copy-button">{card.number}</button>
                </CopyToClipboard>

                
              </td>
              <td className="white">
              <CopyToClipboard text={card.month} onCopy={() => handleCopy(card.month)}>
                  <button className="copy-button">{card.month}</button>
                </CopyToClipboard>
              </td>

              <td className="white">
              <CopyToClipboard text={card.CVC} onCopy={() => handleCopy(card.CVC)}>
                  <button className="copy-button">{card.CVC}</button>
                </CopyToClipboard>
              </td>

              <td>
                <CopyToClipboard text={card.zipcode} onCopy={() => handleCopy(card.zipcode)}>
                  <button className="copy-button">{card.zipcode}</button>
                </CopyToClipboard>
              </td>


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardTable;
