import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
export const createDocument = mutation({
  args: {
    title: v.string(),
    parendDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parendDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });
    return document;
  },
});
export const getDocuments = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      .filter((query) => query.eq(query.field("isArchived"), false))
      .order("desc")
      .collect();
    return documents;
  },
});
export const archive = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const exitingDocument = await ctx.db.get(args.id);
    if (!exitingDocument) {
      throw new Error("Document not found.");
    }
    if (exitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const archivedChildren = async (documendId: Id<"documents">) => {
      const childrens = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documendId)
        )
        .collect();
      for (const child of childrens) {
        await ctx.db.patch(child._id, { isArchived: true });
        archivedChildren(child._id);
      }
    };
    const document = await ctx.db.patch(args.id, { isArchived: true });

    archivedChildren(args.id);
    return document;
  },
});
export const getTrashDocuments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc")
      .collect();

    return documents;
  },
});

export const remove = mutation({
  args: {
    id: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be authenticated to create a document.");
    }
    const userId = identity.subject;
    const exitingDocument = await ctx.db.get(args.id);
    if (!exitingDocument) {
      throw new Error("Document not found.");
    }
    if (exitingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }
    const document = await ctx.db.delete(args.id);
    return document;
  },
});
