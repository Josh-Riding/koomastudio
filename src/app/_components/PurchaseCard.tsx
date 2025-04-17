import React from "react";

const PurchaseCard = ({
  title,
  price,
  features,
  onClick,
}: {
  title: string;
  price: string;
  features: string[];
  onClick: () => void;
}) => {
  return (
    <div className="flex w-80 flex-col rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold text-purple-600">{title}</h2>
      <p className="mb-4 text-gray-500">
        {title === "Basic"
          ? "Ideal for individuals who want to get started with LinkedIn content."
          : "Everything from the Basic plan plus advanced AI-driven content creation tools."}
      </p>
      <p className="mb-4 text-2xl font-bold text-purple-600">{price}</p>
      <ul className="mb-6 list-disc pl-6 text-gray-600">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <div className="mt-auto">
        <button
          onClick={onClick}
          className="w-full rounded-lg bg-purple-600 py-2 text-white transition duration-300 hover:bg-purple-700"
        >
          Try It Out!
        </button>
      </div>
    </div>
  );
};

export default PurchaseCard;
