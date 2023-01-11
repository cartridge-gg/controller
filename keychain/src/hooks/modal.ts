import { useEffect, useState, useCallback } from "react";
import {
  connectToParent,
  AsyncMethodReturns,
  Connection,
} from "@cartridge/penpal";
import { ModalMethods } from "@cartridge/controller";

export const useControllerModal = () => {
  const [modalConn, setModalConn] =
    useState<AsyncMethodReturns<ModalMethods>>();

  useEffect(() => {
    const connection: Connection<ModalMethods> = connectToParent();
    connection.promise.then((modal) => {
      setModalConn(modal);
    });

    return () => {
      connection.destroy();
    };
  }, []);

  const confirm = useCallback(() => {
    if (modalConn) {
      modalConn.onConfirm();
    }

    if (window.opener) {
      window.close();
    }
  }, [modalConn]);

  const cancel = useCallback(() => {
    if (modalConn) {
      modalConn.onCancel();
    }

    if (window.opener) {
      window.close();
    }
  }, [modalConn]);

  return {
    confirm,
    cancel,
  };
};
