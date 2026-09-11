export function textResponse(text: string, isError: boolean = false) {
  return {
    isError,
    content: [
      {
        type: 'text' as const,
        text
      }
    ]
  };
}

export function jsonResponse(data: unknown, isError: boolean = false) {
  return textResponse(JSON.stringify(data, null, 2), isError);
}
