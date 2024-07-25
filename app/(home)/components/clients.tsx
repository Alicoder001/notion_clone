"use client";
import Image from "next/image";
import React from "react";

export const Clients = () => {
  return (
    <div className="max-w-4xl">
      <h2 className="text-4xl mt-6 font-bold">Millions run Notion every day</h2>
      <p>
        {`Powering the world's best team, from next generation startups to
        established enterprises`}
      </p>
      <div className="flex justify-center items-center gap-6 flex-wrap mt-6">
        {clients.map((client, index) => (
          <Image key={index} src={client} alt="client" width={50} height={50} />
        ))}
      </div>
    </div>
  );
};
const clients = [
  "/clients/1.svg",
  "/clients/2.svg",
  "/clients/3.svg",
  "/clients/4.svg",
  "/clients/5.svg",
  "/clients/6.svg",
  "/clients/7.svg",
  "/clients/8.svg",
  "/clients/9.svg",
  "/clients/10.svg",
  "/clients/11.svg",
  "/clients/12.svg",
  "/clients/13.svg",
  "/clients/14.svg",
];
